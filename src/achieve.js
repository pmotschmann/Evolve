import { global, set_alevel, set_ulevel, poppers } from './vars.js';
import { clearElement, calc_mastery, calcPillar, svgIcons, svgViewBox, format_emblem, getBaseIcon, sLevel, vBind, messageQueue, getEaster, easterEgg, getHalloween, trickOrTreat } from './functions.js';
import { races, genus_traits } from './races.js';
import { universe_affixes, piracy } from './space.js';
import { monsters } from './portal.js';
import { loc } from './locale.js'


if (!global.stats['achieve']){
    global.stats['achieve'] = {};
}

if (!global.stats['feat']){
    global.stats['feat'] = {};
}

const achieve_list = {
    misc: [
        'apocalypse','ascended','dreaded','anarchist','second_evolution','blackhole','warmonger',
        'red_tactics','pacifist','neutralized','paradise','scrooge','madagascar_tree','godwin',
        'laser_shark','infested','mass_starvation','colonist','world_domination','illuminati',
        'syndicate','cult_of_personality','doomed','pandemonium','blood_war','landfill','seeder',
        'miners_dream','shaken','blacken_the_sun','resonance','enlightenment','gladiator','corrupted'
    ],
    species: [
        'mass_extinction','extinct_human','extinct_elven','extinct_orc','extinct_cath','extinct_wolven','extinct_centaur','extinct_kobold',
        'extinct_goblin','extinct_gnome','extinct_ogre','extinct_cyclops','extinct_troll','extinct_tortoisan','extinct_gecko','extinct_slitheryn',
        'extinct_arraak','extinct_pterodacti','extinct_dracnid','extinct_entish','extinct_cacti','extinct_pinguicula','extinct_sporgar',
        'extinct_shroomi','extinct_moldling','extinct_mantis','extinct_scorpid','extinct_antid','extinct_sharkin','extinct_octigoran','extinct_dryad',
        'extinct_satyr','extinct_phoenix','extinct_salamander','extinct_yeti','extinct_wendigo','extinct_tuskin','extinct_kamel','extinct_balorg',
        'extinct_imp','extinct_seraph','extinct_unicorn','extinct_junker','extinct_custom'
    ],
    genus: [
        'creator','genus_humanoid','genus_animal','genus_small','genus_giant','genus_reptilian','genus_avian','genus_insectoid',
        'genus_plant','genus_fungi','genus_aquatic','genus_fey','genus_heat','genus_polar','genus_sand','genus_demonic','genus_angelic'
    ],
    planet: [
        'explorer','biome_grassland','biome_oceanic','biome_forest','biome_desert','biome_volcanic','biome_tundra','biome_hellscape','biome_eden',
        'atmo_toxic','atmo_mellow','atmo_rage','atmo_stormy','atmo_ozone','atmo_magnetic','atmo_trashed','atmo_elliptical','atmo_flare','atmo_dense',
        'atmo_unstable'
    ],
    universe: [
        'vigilante','squished','double_density','cross','macro','marble','heavyweight','whitehole','heavy','canceled',
        'eviltwin','microbang','pw_apocalypse','fullmetal','pass'
    ],
    challenge: ['joyless','steelen','dissipated','technophobe','iron_will','failed_history'],    
};

const flairData = {
    colonist: [races[global.race.species].name]
};

export const achievements = {};
Object.keys(achieve_list).forEach(function(type){
    achieve_list[type].forEach(achieve => achievements[achieve] = {
        name: loc(`achieve_${achieve}_name`),
        desc: loc(`achieve_${achieve}_desc`),
        flair: flairData[achieve] ? loc(`achieve_${achieve}_flair`,flairData[achieve]) : loc(`achieve_${achieve}_flair`),
        type: type
    });
});

export const feats = {
    utopia: {
        name: loc("feat_utopia_name"),
        desc: loc("feat_utopia_desc"),
        flair: loc("feat_utopia_flair")
    },
    take_no_advice: {
        name: loc("feat_take_no_advice_name"),
        desc: loc("feat_take_no_advice_desc"),
        flair: loc("feat_take_no_advice_flair")
    },
    ill_advised: {
        name: loc("feat_ill_advised_name"),
        desc: loc("feat_ill_advised_desc"),
        flair: loc("feat_ill_advised_flair")
    },
    organ_harvester: {
        name: loc("feat_organ_harvester_name"),
        desc: loc("feat_organ_harvester_desc"),
        flair: loc("feat_organ_harvester_flair")
    },
    the_misery: {
        name: loc("feat_the_misery_name"),
        desc: loc("feat_the_misery_desc"),
        flair: loc("feat_the_misery_flair")
    },
    energetic: {
        name: loc("feat_energetic_name"),
        desc: loc("feat_energetic_desc"),
        flair: loc("feat_energetic_flair")
    },
    garbage_pie: {
        name: loc("feat_garbage_pie_name"),
        desc: loc("feat_garbage_pie_desc"),
        flair: loc("feat_garbage_pie_flair")
    },
    finish_line: {
        name: loc("feat_finish_line_name"),
        desc: loc("feat_finish_line_desc"),
        flair: loc("feat_finish_line_flair")
    },
    blank_slate: {
        name: loc("feat_blank_slate_name"),
        desc: loc("feat_blank_slate_desc"),
        flair: loc("feat_blank_slate_flair")
    },
    supermassive: {
        name: loc("feat_supermassive_name"),
        desc: loc("feat_supermassive_desc"),
        flair: loc("feat_supermassive_flair")
    },
    steelem: {
        name: loc("feat_steelem_name"),
        desc: loc("feat_steelem_desc"),
        flair: loc("feat_steelem_flair")
    },
    rocky_road: {
        name: loc("feat_rocky_road_name"),
        desc: loc("feat_rocky_road_desc"),
        flair: loc("feat_rocky_road_flair")
    },
    demon_slayer: {
        name: loc("feat_demon_slayer_name"),
        desc: loc("feat_demon_slayer_desc"),
        flair: loc("feat_demon_slayer_flair")
    },
    equilibrium: {
        name: loc("feat_equilibrium_name"),
        desc: loc("feat_equilibrium_desc"),
        flair: loc("feat_equilibrium_flair")
    },
    novice: {
        name: loc("feat_novice_name"),
        desc: loc("feat_achievement_hunter_desc",[10]),
        flair: loc("feat_novice_flair")
    },
    journeyman: {
        name: loc("feat_journeyman_name"),
        desc: loc("feat_achievement_hunter_desc",[25]),
        flair: loc("feat_journeyman_flair")
    },
    adept: {
        name: loc("feat_adept_name"),
        desc: loc("feat_achievement_hunter_desc",[50]),
        flair: loc("feat_adept_flair")
    },
    master: {
        name: loc("feat_master_name"),
        desc: loc("feat_achievement_hunter_desc",[75]),
        flair: loc("feat_master_flair")
    },
    grandmaster: {
        name: loc("feat_grandmaster_name"),
        desc: loc("feat_achievement_hunter_desc",[100]),
        flair: loc("feat_grandmaster_flair")
    },
    nephilim: {
        name: loc("feat_nephilim_name"),
        desc: loc("feat_nephilim_desc"),
        flair: loc("feat_nephilim_flair")
    },
    twisted: {
        name: loc("feat_twisted_name"),
        desc: loc("feat_twisted_desc"),
        flair: loc("feat_twisted_flair")
    },
    friday: {
        name: loc("feat_friday_name"),
        desc: loc("feat_friday_desc"),
        flair: loc("feat_friday_flair")
    },
    valentine: {
        name: loc("feat_love_name"),
        desc: loc("feat_love_desc"),
        flair: loc("feat_love_flair")
    },
    leprechaun: {
        name: loc("feat_leprechaun_name"),
        desc: loc("feat_leprechaun_desc"),
        flair: loc("feat_leprechaun_flair")
    },
    easter: {
        name: loc("feat_easter_name"),
        desc: loc("feat_easter_desc"),
        flair: loc("feat_easter_flair")
    },
    egghunt: {
        name: loc("feat_egghunt_name"),
        desc: loc("feat_egghunt_desc"),
        flair: loc("feat_egghunt_flair")
    },
    halloween: {
        name: loc("feat_boo_name"),
        desc: loc("feat_boo_desc"),
        flair: loc("feat_boo_flair")
    },
    trickortreat: {
        name: loc("feat_trickortreat_name"),
        desc: loc("feat_trickortreat_desc"),
        flair: loc("feat_trickortreat_flair")
    },
    thanksgiving: {
        name: loc("feat_gobble_gobble_name"),
        desc: loc("feat_gobble_gobble_desc"),
        flair: loc("feat_gobble_gobble_flair")
    },
    xmas: {
        name: loc("feat_xmas_name"),
        desc: loc("feat_xmas_desc"),
        flair: loc("feat_xmas_flair")
    },
    fool: {
        name: loc("feat_fool_name"),
        desc: loc("feat_fool_desc"),
        flair: loc("feat_fool_flair")
    }
}

{
    let affix = universeAffix();
    let lvl = 0;
    let ulvl = 0;
    Object.keys(achievements).forEach(function (achievement){
        if (global.stats.achieve[achievement]){
            lvl += global.stats.achieve[achievement].l > 5 ? 5 : global.stats.achieve[achievement].l;
            if (global.stats.achieve[achievement][affix]){
                ulvl += global.stats.achieve[achievement][affix] > 5 ? 5 : global.stats.achieve[achievement][affix];
            }
        }
    });
    set_alevel(lvl);
    set_ulevel(ulvl);
}

export function universeAffix(){
    switch (global.race.universe){
        case 'evil':
            return 'e';
        case 'antimatter':
            return 'a';
        case 'heavy':
            return 'h';
        case 'micro':
            return 'm';
        case 'magic':
            return 'mg';
        default: // Standard
            return 'l';
    }
}

export function unlockAchieve(achievement,small,rank,universe){
    if (global.race.universe !== 'micro' && small === true){
        return false;
    }
    let a_level = alevel();
    let unlock = false;
    let redraw = false;
    if (typeof rank === "undefined" || rank > a_level){
        rank = a_level;
    }
    let upgrade = true;
    if (typeof global.stats.achieve[achievement] === "undefined"){
        global.stats.achieve[achievement] = { l: 0 };
        upgrade = false;
    }
    if ((global.race.universe === 'micro' && small === true) || (global.race.universe !== 'micro' && small !== true)){
        if (global.stats.achieve[achievement] && global.stats.achieve[achievement].l < rank){
            global.settings.showAchieve = true;
            global.stats.achieve[achievement].l = rank;
            messageQueue(loc(upgrade ? 'achieve_unlock_achieve_upgrade' : 'achieve_unlock_achieve', [achievements[achievement].name] ),'special');
            redraw = true;
            unlock = true;
        }
    }
    if (global.stats.achieve[achievement] && universe !== 'l'){
        let u_affix = universe || universeAffix();
        if (!global.stats.achieve[achievement][u_affix] || (global.stats.achieve[achievement][u_affix] && global.stats.achieve[achievement][u_affix] < rank)){
            let i_upgrade = global.stats.achieve[achievement][u_affix] ? true : false;
            global.stats.achieve[achievement][u_affix] = rank;
            redraw = true;
            if (!unlock){
                messageQueue(loc(i_upgrade ? 'achieve_unlock_achieve_icon_upgrade' : 'achieve_unlock_achieve_icon', [achievements[achievement].name] ),'special');
            }
        }
    }
    if (redraw){
        calc_mastery(true);
        drawPerks();
        drawAchieve();
    }
    return unlock;
}

export function unlockFeat(feat,small,rank){
    if ((global.race.universe === 'micro' && small !== true) || (global.race.universe !== 'micro' && small === true)){
        return false;
    }
    let a_level = alevel();
    if (typeof rank === "undefined" || rank > a_level){
        rank = a_level;
    }
    if (!global.stats.feat[feat] || (global.stats.feat[feat] && global.stats.feat[feat] < rank)){
        global.settings.showAchieve = true;
        global.stats.feat[feat] = rank;
        messageQueue(loc('feat_unlocked', [feats[feat].name] ),'special');
        drawPerks();
        drawAchieve();
        return true;
    }
    return false;
}

export function setupStats(){
    clearElement($('#achieve'));
    clearElement($('#stats'));
    let stats = $('<div id="statsPanel"></div>');
    $('#stats').append(stats);
    let perks = $('<div id="perksPanel"></div>');
    $('#perks').append(perks);
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    drawStats();
    drawPerks();
    drawAchieve();
}

export function drawAchieve(args){
    clearElement($('#achievePanel'));
    let achieve = $('#achievePanel');
    let earned = 0;
    let total = 0;
    let level = 0;
    let ulevel = 0;

    let affix = universeAffix();
    let fool = typeof args === 'object' && args['fool'] ? args.fool : false;

    Object.keys(achievements).forEach(function (achievement){
        let baseIcon = getBaseIcon(achievement,'achievement');
        total++;
        if (global.stats.achieve[achievement]){
            earned++;
            level += global.stats.achieve[achievement].l > 5 ? 5 : global.stats.achieve[achievement].l;
            if (global.stats.achieve[achievement][affix]){
                ulevel += global.stats.achieve[achievement][affix] > 5 ? 5 : global.stats.achieve[achievement][affix];
            }
            let emblem = format_emblem(achievement,16,baseIcon,fool);
            if ((fool && global.stats.achieve[achievement].l > 1) || !fool){
                achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span>${emblem}</div></b-tooltip>`));
            }
            else if (fool && global.stats.achieve[achievement].l === 1){
                earned--;
            }
        }
    });
    set_alevel(level);
    set_ulevel(ulevel);

    if (fool && !global.stats.feat['fool']){
        let thefool = $(`<b-tooltip :label="feat('fool')" position="is-bottom" size="is-small" animated><div id="thefool" class="achievement"><span class="has-text-danger">${feats.fool.name}</span><span>${loc('feat_fool_spoof')}</span></div></b-tooltip>`);
        achieve.append(thefool);
    }
    else {
        Object.keys(feats).forEach(function (feat){
            let baseIcon = getBaseIcon(feat,'feat');
            if (global.stats.feat[feat]){
                let star = global.stats.feat[feat] > 1 ? `<p class="flair" title="${sLevel(global.stats.feat[feat])} ${loc(baseIcon)}"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
                if (feat === 'easter'){
                    let egg = easterEgg(4,14);
                    if (egg.length > 0){
                        star = egg;
                    }
                }
                achieve.append($(`<b-tooltip :label="feat('${feat}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-danger">${feats[feat].name}</span><span>${feats[feat].desc}</span>${star}</div></b-tooltip>`));
            }
        });
    }

    let trick = trickOrTreat(5,12);
    achieve.prepend(`<div class="has-text-warning">${loc("achieve_draw_achieve_earned",[earned,total])}${trick}</div>`);

    vBind({
        el: '#achievePanel',
        methods: {
            flair(flair){
                return achievements[flair].flair;
            },
            feat(flair){
                return feats[flair].flair;
            }
        }
    });

    let a_level = alevel();

    if ($('#topBar span.flair')){
        clearElement($('#topBar span.flair'),true);
    }
    let egg = easterEgg(1,14);
    if (egg.length > 0){
        $('#topBar .planet').after($(egg));
    }
    if (a_level > 1 && $('#topBar .planet .flair').length === 0){
        if (egg.length === 0){
            let bIcon = getBaseIcon('topbar','challenge');
            $('#topBar .planet').after(`<span class="flair"><svg class="star${a_level}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(bIcon)}" xml:space="preserve">${svgIcons(bIcon)}</svg></span>`);
        }

        $('#topBar .planetWrap .flair').on('mouseover',function(){
            var popper = $(`<div id="topbarPlanet" class="popper has-background-light has-text-dark"></div>`);
            $('#main').append(popper);

            if (global.race['no_plasmid']){ popper.append($(`<div>${loc('evo_challenge_plasmid')}</div>`)); }
            if (global.race['weak_mastery']){ popper.append($(`<div>${loc('evo_challenge_mastery')}</div>`)); }
            if (global.race['no_trade']){ popper.append($(`<div>${loc('evo_challenge_trade')}</div>`)); }
            if (global.race['no_craft']){ popper.append($(`<div>${loc('evo_challenge_craft')}</div>`)); }
            if (global.race['no_crispr']){ popper.append($(`<div>${loc('evo_challenge_crispr')}</div>`)); }

            popper.show();
            poppers['topbarPlanet'] = new Popper($('#topBar .planetWrap .flair'),popper);

        });

        $('#topBar .planetWrap .flair').on('mouseout',function(){
            $(`#topbarPlanet`).hide();
            poppers['topbarPlanet'].destroy();
            clearElement($(`#topbarPlanet`),true);
        });
    }

    if (fool && !global.stats.feat['fool']){
        $(`#thefool`).on('mouseover',function(){
            if (global.race.universe === 'micro'){
                unlockFeat('fool',true);
            }
            else {
                unlockFeat('fool');
            }
            drawAchieve();
        });
    }
}

export function alevel(){
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (a_level > 5){
        a_level = 5;
    }
    return a_level;
}

export function checkAchievements(){
    let a_level = alevel();

    for (let t_level=a_level; t_level >= 0; t_level--){
        checkBigAchievement('extinct_', 'mass_extinction', 25, t_level);
        if (global.race.universe === 'evil') {
            checkBigAchievementUniverse('extinct_', 'vigilante', 12, t_level);
        }
        checkBigAchievement('genus_', 'creator', 9, t_level);
        checkBigAchievement('biome_', 'explorer', 6, t_level);
        if (global.race.universe === 'heavy') {
            checkBigAchievementUniverse('genus_', 'heavyweight', 8, t_level);
        }
    }

    if (global.tech['supercollider'] && global.tech['supercollider'] >= 99){
        unlockAchieve('blackhole');
    }
    if (global.stats.starved >= 100){
        unlockAchieve('mass_starvation');
    }
    if (Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue)) >= 8){
        unlockAchieve('warmonger');
    }
    if (global.stats.died >= 250){
        unlockAchieve('red_tactics');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass + global.interstellar['stellar_engine'].exotic) >= 12){
        unlockAchieve('landfill');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass + global.interstellar['stellar_engine'].exotic) >= 100){
        unlockFeat('supermassive');
    }

    if (global.tech['piracy'] && global.tech['chthonian'] && global.tech['chthonian'] >= 2 && global.galaxy){
        if (piracy('gxy_stargate') === 1 && piracy('gxy_gateway') === 1 && piracy('gxy_gorddon') === 1 && piracy('gxy_alien1') === 1 && piracy('gxy_alien2') === 1 && piracy('gxy_chthonian') === 1){
            unlockAchieve('neutralized');
        }
    }

    if (global.city.morale.current >= 200){
        unlockAchieve('paradise');
        if (global.city.morale.current >= 500){
            unlockFeat('utopia');
        }
    }

    if (global.resource.hasOwnProperty('Money') && global.resource.Money.amount >= 1000000000){
        unlockAchieve('scrooge');
    }

    if (global.tech['pillars']){
        let genus = {};
        let rCnt = 0;
        let equilRank = 5;
        Object.keys(global.pillars).forEach(function(race){                
            if (races[race]){
                if (!genus[races[race].type] || global.pillars[race] > genus[races[race].type]){
                    genus[races[race].type] = global.pillars[race];
                }
                if (global.pillars[race] < equilRank){
                    equilRank = global.pillars[race];
                }
                rCnt++;
            }
        });
        if (Object.keys(genus).length >= Object.keys(genus_traits).length){
            let rank = 5;
            Object.keys(genus).forEach(function(g){
                if (genus[g] < rank){
                    rank = genus[g];
                }
            });
            unlockAchieve('enlightenment',false,rank);
        }
        if (rCnt >= Object.keys(races).length - 1){
            unlockAchieve('resonance');
            unlockFeat('equilibrium',false,equilRank);
        }
    }

    if (global.portal.hasOwnProperty('mechbay') && global.tech.hasOwnProperty('hell_spire') && global.tech.hell_spire >= 9){
        let mobs = Object.keys(monsters).length;
        let highest = {};
        Object.keys(global.stats.spire).forEach(function(universe){
            let current = {};
            Object.keys(global.stats.spire[universe]).forEach(function(boss){
                if (monsters[boss]){
                    if (!highest.hasOwnProperty(boss) || highest[boss] < global.stats.spire[universe][boss]){
                        highest[boss] = global.stats.spire[universe][boss];
                    }
                    if (global.stats.spire[universe][boss] > 0){
                        current[boss] = global.stats.spire[universe][boss];
                    }
                }
            });
            if (Object.keys(current).length === mobs){
                unlockAchieve('gladiator',false,Math.min(...Object.values(current)),universe);
            }
        });
        if (Object.keys(highest).length === mobs){
            unlockAchieve('gladiator',false,Math.min(...Object.values(highest)),'l');
        }
    }

    const date = new Date();
    let easter = getEaster();
    let halloween = getHalloween();
    if (!global.settings.boring && date.getDate() === 13 && date.getDay() === 5 && global.resource[global.race.species].amount >= 1){
        let murder = false;
        if (global.race.universe === 'micro'){
            murder = unlockFeat('friday',true);
        }
        else {
            murder = unlockFeat('friday');
        }
        if (murder){
            global.resource[global.race.species].amount--;
        }
    }
    else if (!global.settings.boring && date.getMonth() === 1 && date.getDate() === 14){
        if (global.race.universe === 'micro'){
            unlockFeat('valentine',true);
        }
        else {
            unlockFeat('valentine');
        }
    }
    else if (!global.settings.boring && date.getMonth() === 2 && date.getDate() === 17){
        if (global.race.universe === 'micro'){
            unlockFeat('leprechaun',true);
        }
        else {
            unlockFeat('leprechaun');
        }
    }
    else if (easter.active){
        if (global.race.universe === 'micro'){
            unlockFeat('easter',true);
        }
        else {
            unlockFeat('easter');
        }

        let checkAll = true;
        for (let i=1; i<13; i++){
            if (!global.special.egg[`egg${i}`]){
                checkAll = false;
            }
        }

        if (checkAll){
            if (global.race.universe === 'micro'){
                unlockFeat('egghunt',true);
            }
            else {
                unlockFeat('egghunt');
            }

        }
    }
    else if (halloween.active){
        let checkAll = true;
        for (let i=1; i<13; i++){
            if (!global.special.trick[`trick${i}`]){
                checkAll = false;
            }
        }

        if (checkAll){
            if (global.race.universe === 'micro'){
                unlockFeat('trickortreat',true);
            }
            else {
                unlockFeat('trickortreat');
            }

        }

        if (date.getMonth() === 9 && date.getDate() === 31){
            if (global.race.universe === 'micro'){
                unlockFeat('halloween',true);
            }
            else {
                unlockFeat('halloween');
            }
        }
    }
    else if (!global.settings.boring && date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28){
        if (global.race.universe === 'micro'){
            unlockFeat('thanksgiving',true);
        }
        else {
            unlockFeat('thanksgiving');
        }
    }
    else if (!global.settings.boring && date.getMonth() === 11 && date.getDate() == 25){
        if (global.race.universe === 'micro'){
            unlockFeat('xmas',true);
        }
        else {
            unlockFeat('xmas');
        }
    }

    if (global.stats.dkills >= 666000000){
        unlockFeat('demon_slayer');
    }

    // total achievements feat
    {
        for (let t_level=a_level; t_level >= 1; t_level--){

            let total = 0;
            const keys = Object.keys(achievements)
            for (const key of keys) {
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= t_level){
                    total++;
                }
            }
            let progress = [
                {c: 10, f: 'novice'},
                {c: 25, f: 'journeyman'},
                {c: 50, f: 'adept'},
                {c: 75, f: 'master'},
                {c: 100, f: 'grandmaster'}
            ];
            for (let i=0; i<5; i++){
                if (total >= progress[i].c){
                    if (global.race.universe === 'micro'){
                        unlockFeat(progress[i].f,true,t_level);
                    }
                    else {
                        unlockFeat(progress[i].f,false,t_level);
                    }
                }
            }
        }
    }
}

function checkBigAchievement(frag, name, num, level){
    if (!global.stats.achieve[name] || global.stats.achieve[name].l < level){
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes(frag)){
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= level) {
                    total++;
                }
            }
        }
        if (total >= num){
            unlockAchieve(name,false,level);
            if (global.race.universe !== 'standard'){
                switch (global.race.universe) {
                    case 'evil':
                        global.stats.achieve[name].e = undefined;
                        break;
                    case 'antimatter':
                        global.stats.achieve[name].a = undefined;
                        break;
                    case 'heavy':
                        global.stats.achieve[name].h = undefined;
                        break;
                    case 'micro':
                        global.stats.achieve[name].m = undefined;
                        break;
                    case 'magic':
                        global.stats.achieve[name].mg = undefined;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    if (global.race.universe !== 'standard') {
        checkBigAchievementUniverse(frag, name, num, level);
    }
}

function checkBigAchievementUniverse(frag, name, num, level){
    let proceed = false;
    switch (global.race.universe) {
        case 'evil':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].e === "undefined" || global.stats.achieve[name].e < level){
                proceed = true;
            }
            break;
        case 'antimatter':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].a === "undefined" || global.stats.achieve[name].a < level){
                proceed = true;
            }
            break;
        case 'heavy':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].h === "undefined" || global.stats.achieve[name].h < level){
                proceed = true;
            }
            break;
        case 'micro':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].m === "undefined" || global.stats.achieve[name].m < level){
                proceed = true;
            }
            break;
        case 'magic':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].mg === "undefined" || global.stats.achieve[name].mg < level){
                proceed = true;
            }
            break;
        default:
            break;
    }
    if (proceed) {
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes(frag)){
                switch (global.race.universe){
                    case 'evil':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['e'] && global.stats.achieve[key].e >= level){
                            total++;
                        }
                        break;
                    case 'antimatter':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['a'] && global.stats.achieve[key].a >= level){
                            total++;
                        }
                        break;
                    case 'heavy':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['h'] && global.stats.achieve[key].h >= level){
                            total++;
                        }
                        break;
                    case 'micro':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['m'] && global.stats.achieve[key].m >= level){
                            total++;
                        }
                        break;
                    case 'magic':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['mg'] && global.stats.achieve[key].mg >= level){
                            total++;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        if (total >= num){
            unlockAchieve(name,false,level);
        }
    }
}

export const perkList = {
    blackhole: {
        name: loc(`achieve_blackhole_name`),
        desc(){
            let bonus = global.stats.achieve['blackhole'] ? global.stats.achieve.blackhole.l * 5 : 5;
            return loc("achieve_perks_blackhole",[bonus]);
        },
        active(){
            return global.stats.achieve['blackhole'] && global.stats.achieve['blackhole'].l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`])
        ]
    },
    creator: {
        name: loc(`achieve_creator_name`),
        desc(){
            let bonus = 1 + (global.stats.achieve['creator'] ? global.stats.achieve['creator'].l * 0.5 : 0.5);
            return loc("achieve_perks_creator",[bonus]);
        },
        active(){
            return global.stats.achieve['creator'] && global.stats.achieve.creator.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_creator_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_creator_name`)}</span>`])
        ]
    },
    mass_extinction: {
        name: loc(`achieve_mass_extinction_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_mass_extinction");
                },
                active(){
                    return global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    let rank = global.stats.achieve['mass_extinction'] ? global.stats.achieve.mass_extinction.l : 1;
                    let bonus = (rank - 1) * 50;
                    return loc("achieve_perks_mass_extinction2",[bonus]);
                },
                active(){
                    return global.stats.achieve['mass_extinction'] && global.stats.achieve.mass_extinction.l > 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_mass_extinction_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_mass_extinction_name`)}</span>`])
        ]
    },
    explorer: {
        name: loc(`achieve_explorer_name`),
        desc(){
            let bonus = global.stats.achieve['explorer'].l;
            return loc("achieve_perks_explorer",[bonus]);
        },
        active(){
            return global.stats.achieve['explorer'] && global.stats.achieve.explorer.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_explorer_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_explorer_name`)}</span>`])
        ]
    },
    miners_dream: {
        name: loc(`achieve_miners_dream_name`),
        desc(){
            let numGeo = global.stats.achieve['miners_dream'] ? global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l : 0;
            return loc("achieve_perks_miners_dream",[numGeo]);
        },
        active(){
            return global.stats.achieve['miners_dream'] && global.stats.achieve.miners_dream.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_miners_dream_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_miners_dream_name`)}</span>`])
        ]
    },
    extinct_junker: {
        name: loc(`achieve_extinct_junker_name`),
        desc(){
            return loc("achieve_perks_enlightened");
        },
        active(){
            return global.stats.achieve['extinct_junker'] && global.stats.achieve.extinct_junker.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_extinct_junker_name`)}</span>`])
        ]
    },
    joyless: {
        name: loc(`achieve_joyless_name`),
        desc(){
            let bonus = global.stats.achieve['joyless'].l * 2;
            return loc("achieve_perks_joyless",[bonus]);
        },
        active(){
            return global.stats.achieve['joyless'] && global.stats.achieve.joyless.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_joyless_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_joyless_name`)}</span>`])
        ]
    },
    steelen: {
        name: loc(`achieve_steelen_name`),
        desc(){
            let bonus = global.stats.achieve['steelen'].l * 2;
            return loc("achieve_perks_steelen",[bonus]);
        },
        active(){
            return global.stats.achieve['steelen'] && global.stats.achieve.steelen.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_steelen_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_steelen_name`)}</span>`])
        ]
    },
    whitehole: {
        name: loc(`achieve_whitehole_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_whitehole");
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            },
            {
                desc(){
                    let bonus = global.stats.achieve['whitehole'].l * 5;
                    return loc("achieve_perks_whitehole2",[bonus]);
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_whitehole_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_whitehole_name`)}</span>`])
        ]
    },
    heavyweight: {
        name: loc(`achieve_heavyweight_name`),
        desc(){
            let bonus = global.stats.achieve['heavyweight'].l * 4;
            return loc("achieve_perks_heavyweight",[bonus]);
        },
        active(){
            return global.stats.achieve['heavyweight'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_heavyweight_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_heavyweight_name`)}</span>`])
        ]
    },
    dissipated: {
        name: loc(`achieve_dissipated_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_dissipated1",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    let bonus = global.stats.achieve['dissipated'].l >= 5 ? 2 : 1;
                    return loc("achieve_perks_dissipated2",[bonus]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_dissipated3",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_dissipated4",[1]);
                },
                active(){
                    return global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_dissipated_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_dissipated_name`)}</span>`])
        ]
    },
    anarchist: {
        name: loc(`achieve_anarchist_name`),
        desc(){
            let bonus = global.stats.achieve['anarchist'].l * 10;
            return loc("achieve_perks_anarchist",[bonus]);
        },
        active(){
            return global.stats.achieve['anarchist'] && global.stats.achieve['anarchist'].l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_anarchist_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_anarchist_name`)}</span>`])
        ]
    },
    technophobe: {
        name: loc(`achieve_technophobe_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_technophobe1",[25]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve['technophobe'].l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    let bonus = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            bonus += 5;
                        }
                    }
                    return loc("achieve_perks_technophobe2",[bonus]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    let gems = 1;
                    for (let i=1; i<universe_affixes.length; i++){
                        if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                            gems += 1;
                        }
                    }
                    return gems > 1 ? loc("achieve_perks_technophobe3a",[gems]) : loc("achieve_perks_technophobe3",[gems]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_technophobe4",[10]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? true : false;
                }
            },
            {
                desc(){
                    let bonus = global.stats.achieve['technophobe'] ? global.stats.achieve.technophobe.l : 0;
                    return loc("achieve_perks_technophobe5",[bonus]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe`,[`<span class="has-text-caution">${loc(`achieve_technophobe_name`)}</span>`])
        ]
    },
    iron_will: {
        name: loc(`achieve_iron_will_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_iron_will1",[0.15]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will2",[10]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will3",[6]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will4",[1]);
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_iron_will5");
                },
                active(){
                    return global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_iron_will_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill`,[`<span class="has-text-caution">${loc(`evo_challenge_cataclysm`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill2`,[1,`<span class="has-text-caution">${loc(`space_red_ziggurat_title`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[2,`<span class="has-text-caution">${loc(`tech_elerium_mining`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[3,`<span class="has-text-caution">${loc(`tech_lasers`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill3`,[4,`<span class="has-text-caution">${loc(`tech_generational_ship`)}</span>`]),
            loc(`wiki_perks_achievement_note_ironwill4`,[5,`<span class="has-text-caution">${loc(`wiki_resets_bioseed`)}</span>`])
        ]
    },
    failed_history: {
        name: loc(`achieve_failed_history_name`),
        desc(){
            return loc("achieve_perks_failed_history",[2]);
        },
        active(){
            return global.stats.achieve['failed_history'] && global.stats.achieve.failed_history.l >= 5 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_failed_history_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_failed_history`,[`<span class="has-text-caution">${loc(`evo_challenge_cataclysm`)}</span>`])
        ]
    },
    gladiator: {
        name: loc(`achieve_gladiator_name`),
        desc(){
            let mech = global.stats.achieve['gladiator'] ? global.stats.achieve.gladiator.l : 1;
            return loc("achieve_perks_gladiator",[mech * 20]);
        },
        active(){
            return global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`])
        ]
    },
    creep: {
        name: loc(`wiki_arpa_crispr_creep`),
        desc(){
            return loc("arpa_perks_creep",[global.genes['creep'] ? global.genes.creep : 0]);
        },
        active(){
            return global.genes['creep'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_genetic_memory_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_animus_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_divine_remembrance_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_divine_proportion_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_genetic_repository_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    store: {
        name: loc(`wiki_arpa_crispr_store`),
        desc(){
            let psb = global.genes['store'] && global.genes.store > 1 ? (global.genes.store === 2 ? 0.06 : 0.08) : 0.04;
            return loc(global.genes['store'] && global.genes.store >= 4 ? "arpa_perks_store2" : "arpa_perks_store1",[psb]);
        },
        active(){
            return global.genes['store'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_spatial_reasoning_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_spatial_superiority_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_spatial_supremacy_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_dimensional_warping_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    evolve: {
        name: loc(`wiki_arpa_crispr_evolve`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_evolve");
                },
                active(){
                    return global.genes['evolve'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_recombination_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_homologous_recombination_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_genetic_reshuffling_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_recombinant_dna_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 5 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_chimeric_dna_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 6 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_molecular_cloning_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 7 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_transgenes_desc");
                },
                active(){
                    return global.genes['evolve'] && global.genes.evolve >= 8 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_morphogenesis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_recombination_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_homologous_recombination_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_genetic_reshuffling_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_recombinant_dna_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_chimeric_dna_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_molecular_cloning_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_transgenes_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    birth: {
        name: loc(`wiki_arpa_crispr_birth`),
        desc(){
            return loc("arpa_perks_birth");
        },
        active(){
            return global.genes['birth'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_replication_title`)}</span>`]),
        ]
    },
    enhance: {
        name: loc(`wiki_arpa_crispr_enhance`),
        desc(){
            return loc("arpa_perks_enhance");
        },
        active(){
            return global.genes['enhance'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_enhanced_muscle_fiber_title`)}</span>`])
        ]
    },
    crafty: {
        name: loc(`wiki_arpa_crispr_crafty`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_artificer_desc");
                },
                active(){
                    return global.genes['crafty'] ? true : false;
                }
            },
            {
                desc(){
                    let bonus = global.genes['crafty'] && global.genes.crafty >= 3 ? 100 : 50;
                    return loc("arpa_genepool_crafting_desc",[bonus]);
                },
                active(){
                    return global.genes['crafty'] && global.genes.crafty >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_artificer_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_detail_oriented_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_rigorous_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    synthesis: {
        name: loc(`wiki_arpa_crispr_synthesis`),
        desc(){
            let base = global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 4 : 3) : 2;
            let auto = global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 50 : 25) : 10;
            return loc("arpa_genepool_synthesis_desc",[base,auto]);
        },
        active(){
            return global.genes['synthesis'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_synthesis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_karyokinesis_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_cytokinesis_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    challenge: {
        name: loc(`wiki_arpa_crispr_challenge`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_challenge");
                },
                active(){
                    return global.genes['challenge'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_unlocked_desc");
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_challenge2",[
                        global.genes['challenge'] && global.genes['challenge'] >= 4 ? 80 : 60,
                        global.genes['challenge'] && global.genes['challenge'] >= 4 ? 40 : 60
                    ]);
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_challenge3");
                },
                active(){
                    return global.genes['challenge'] && global.genes.challenge >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_hardened_genes_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_unlocked_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_universal_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_standard_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_mastered_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    ancients: {
        name: loc(`wiki_arpa_crispr_ancients`),
        group: [
            {
                desc(){
                    return loc("arpa_perks_ancients");
                },
                active(){
                    return global.genes['ancients'] ? true : false;
                }
            },
            {
                desc(){
                    return global.genes['ancients'] && global.genes.ancients >= 4 ? loc("arpa_perks_ancients3") : loc("arpa_perks_ancients2");
                },
                active(){
                    return global.genes['ancients'] && global.genes.ancients >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_ancients4",[global.genes['ancients'] && global.genes.ancients >= 5 ? 50 : 25]);
                },
                active(){
                    return global.genes['ancients'] && global.genes.ancients >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_ancients_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_faith_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_devotion_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_acolyte_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_conviction_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    trader: {
        name: loc(`wiki_arpa_crispr_trader`),
        desc(){
            return loc("arpa_genepool_negotiator_desc");
        },
        active(){
            return global.genes['trader'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_negotiator_title`)}</span>`])
        ]
    },
    transcendence: {
        name: loc(`wiki_arpa_crispr_transcendence`),
        desc(){
            return loc("arpa_genepool_transcendence_desc");
        },
        active(){
            return global.genes['transcendence'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_transcendence_title`)}</span>`])
        ]
    },
    queue: {
        name: loc(`wiki_arpa_crispr_queue`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_geographer_desc");
                },
                active(){
                    return global.genes['queue'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_architect_desc");
                },
                active(){
                    return global.genes['queue'] && global.genes.queue >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_geographer_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_architect_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    plasma: {
        name: loc(`wiki_arpa_crispr_plasma`),
        desc(){
            let plasmid_cap = global.genes['plasma'] >= 2 ? 5 : 3;
            return loc('arpa_genepool_mitosis_desc',[plasmid_cap]);
        },
        active(){
            return global.genes['plasma'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_mitosis_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_metaphase_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    mutation: {
        name: loc(`wiki_arpa_crispr_mutation`),
        group: [
            {
                desc(){
                    return global.genes['mutation'] && global.genes.mutation > 1 ? loc("arpa_perks_mutation2") : loc("arpa_perks_mutation1");
                },
                active(){
                    return global.genes['mutation'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_perks_mutation3");
                },
                active(){
                    return global.genes['mutation'] && global.genes.mutation >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_mutation_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_transformation_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_metamorphosis_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    bleed: {
        name: loc(`wiki_arpa_crispr_bleed`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_bleeding_effect_desc",[2.5]);
                },
                active(){
                    return global.genes['bleed'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_synchronicity_desc",[25]);
                },
                active(){
                    return global.genes['bleed'] && global.genes.bleed >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_astral_awareness_desc");
                },
                active(){
                    return global.genes['bleed'] && global.genes.bleed >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_bleeding_effect_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_synchronicity_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_astral_awareness_title`)}</span>`
                ].join(', ')
            ]),
            loc(`wiki_perks_crispr_note_bleed`,[`<span class="has-text-caution">${loc(`arpa_genepool_bleeding_effect_title`)}</span>`]),
        ]
    },
    harmonic: {
        name: loc(`harmonic`),
        desc(){
            let harmonic = calcPillar();
            return loc("perks_harmonic",[+((harmonic[0] - 1) * 100).toFixed(0), +((harmonic[1] - 1) * 100).toFixed(0)]);
        },
        active(){
            let harmonic = calcPillar();
            return global['pillars'] && harmonic[0] > 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_harmonic_note1`),
            loc(`wiki_perks_harmonic_note2`)
        ]
    },
    novice: {
        name: loc(`feat_novice_name`),
        desc(){
            let rank = global.stats.feat['novice'] ? global.stats.feat['novice'] : 1;
            let rna = rank / 2;
            let dna = rank / 4;
            return loc("achieve_perks_novice",[rna,dna]);
        },
        active(){
            return global.stats.feat['novice'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[10]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    journeyman: {
        name: loc(`feat_journeyman_name`),
        desc(){
            if (global.stats.feat['journeyman'] && global.stats.feat['journeyman'] > 1){
                let rqueue = global.stats.feat['journeyman'] >= 3 ? (global.stats.feat['journeyman'] >= 5 ? 3 : 2) : 1;
                let queue = global.stats.feat['journeyman'] >= 4 ? 2 : 1;
                return loc("achieve_perks_journeyman2",[rqueue,queue]);
            }
            else {
                return loc("achieve_perks_journeyman1",[1]);
            }
        },
        active(){
            return global.stats.feat['journeyman'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[25]),
            loc(`wiki_perks_progress_note2`)
        ]
    }
};

export function drawPerks(){
    clearElement($('#perksPanel'));
    let perks = $('#perksPanel');
    let hasPerk = false;
    Object.keys(perkList).forEach(function(perk){
        if (perkList[perk].hasOwnProperty('group')){
            let isactive = false;
            let gperk = $(`<div class="achievement"><span class="has-text-warning">${perkList[perk].name}</span></div>`);
            perkList[perk].group.forEach(function(subperk){
                if (subperk.active()){
                    isactive = true;
                    gperk.append($(`<div class="perk">${subperk.desc()}</div>`));
                }
            });
            if (isactive){
                hasPerk = true;
                perks.append(gperk);
            }
        }
        else {
            if (perkList[perk].active()){
                hasPerk = true;
                perks.append($(`<div class="achievement"><span class="has-text-warning">${perkList[perk].name}</span><span>${perkList[perk].desc()}</span></div>`));
            }
        }
    });
    if (!hasPerk){
        perks.append($(`<div class="has-text-caution">${loc(`perks_none`)}</div>`));
    }
}

export function drawStats(){
    clearElement($('#statsPanel'));
    let stats = $('#statsPanel');

    stats.append(`<div><span class="has-text-success">${loc("achieve_stats_overall")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_plasmid_earned")}</span> {{ plasmid | format }}</div>`);
    if (global.stats.antiplasmid > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_antiplasmid_earned")}</span> {{ antiplasmid | format }}</div>`);
    }
    if (global.stats.phage > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_phage_earned")}</span> {{ phage | format }}</div>`);
    }
    if (global.stats.dark > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_dark_earned")}</span> {{ dark | format }}</div>`);
    }
    if (global.stats.harmony > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_harmony_earned")}</span> {{ harmony | format }}</div>`);
    }
    if (global.stats.blood > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blood_earned")}</span> {{ blood | format }}</div>`);
    }
    if (global.stats.artifact > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_artifact_earned")}</span> {{ artifact | format }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know | t_know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved | t_starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died | t_died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ days | played | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_total_resets")}</span> {{ reset | format }}</div>`);
    if (global.stats.mad > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_mad_resets")}</span> {{ mad | format }}</div>`);
    }
    if (global.stats.bioseed > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_bioseed_resets")}</span> {{ bioseed | format }}</div>`);
    }
    if (global.stats.cataclysm > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_cataclysm_resets")}</span> {{ cataclysm | format }}</div>`);
    }
    if (global.stats.blackhole > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blackhole_resets")}</span> {{ blackhole | format }}</div>`);
    }
    if (global.stats.ascend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_ascension_resets")}</span> {{ ascend | format }}</div>`);
    }
    if (global.stats.descend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_descension_resets")}</span> {{ descend | format }}</div>`);
    }
    if (global.stats.portals > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_portals")}</span> {{ portals | format }}</div>`);
    }
    stats.append(`<div class="cstat"><span class="has-text-success">${loc("achieve_stats_current_game")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_attacks_made")}</span> {{ attacks | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ days | format }}</div>`);
    if (global.stats.dkills > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_demons_kills")}</span> {{ dkills | format }}</div>`);
    }

    vBind({
        el: '#statsPanel',
        data: global.stats,
        filters: {
            played(d){
                return d + global.stats.tdays;
            },
            t_know(k){
                return k + global.stats.tknow;
            },
            t_starved(s){
                return s + global.stats.tstarved;
            },
            t_died(d){
                return d + global.stats.tdied;
            },
            format(s){
                return s.toLocaleString();
            }
        }
    });
}
