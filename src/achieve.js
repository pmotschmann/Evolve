import { global, set_alevel, set_ulevel } from './vars.js';
import { clearElement, popover, flib, calc_mastery, masteryType, calcPillar, svgIcons, svgViewBox, format_emblem, getBaseIcon, sLevel, vBind, calcQueueMax, calcRQueueMax, messageQueue, eventActive, easterEgg, getHalloween, trickOrTreat, harmonyEffect } from './functions.js';
import { races, genus_traits } from './races.js';
import { universe_affixes, universe_types, piracy } from './space.js';
import { monsters } from './portal.js';
import { loc } from './locale.js'

const achieve_list = {
    misc: [
        'apocalypse','ascended','dreaded','anarchist','second_evolution','blackhole','warmonger',
        'red_tactics','pacifist','neutralized','paradise','scrooge','madagascar_tree','godwin',
        'laser_shark','infested','mass_starvation','colonist','world_domination','illuminati',
        'syndicate','cult_of_personality','doomed','pandemonium','blood_war','landfill','seeder',
        'miners_dream','shaken','blacken_the_sun','trade','resonance','enlightenment','gladiator',
        'corrupted','red_dead'
    ],
    species: [
        'mass_extinction','extinct_human','extinct_elven','extinct_orc','extinct_cath','extinct_wolven','extinct_vulpine','extinct_centaur',
        'extinct_rhinotaur','extinct_capybara','extinct_kobold','extinct_goblin',
        //'extinct_rhinotaur','extinct_capybara','extinct_bearkin','extinct_porkenari','extinct_hedgeoken','extinct_kobold','extinct_goblin',
        'extinct_gnome','extinct_ogre','extinct_cyclops','extinct_troll','extinct_tortoisan','extinct_gecko','extinct_slitheryn',
        'extinct_arraak','extinct_pterodacti','extinct_dracnid','extinct_entish','extinct_cacti','extinct_pinguicula','extinct_sporgar',
        'extinct_shroomi','extinct_moldling','extinct_mantis','extinct_scorpid','extinct_antid','extinct_sharkin','extinct_octigoran','extinct_dryad',
        'extinct_satyr','extinct_phoenix','extinct_salamander','extinct_yeti','extinct_wendigo','extinct_tuskin','extinct_kamel','extinct_balorg',
        'extinct_imp','extinct_seraph','extinct_unicorn','extinct_synth','extinct_nano','extinct_junker','extinct_sludge','extinct_custom'
    ],
    genus: [
        'creator','genus_humanoid','genus_carnivore','genus_herbivore','genus_small','genus_giant','genus_reptilian','genus_avian',
        //'creator','genus_humanoid','genus_carnivore','genus_omnivore','genus_herbivore','genus_small','genus_giant','genus_reptilian','genus_avian',
        'genus_insectoid','genus_plant','genus_fungi','genus_aquatic','genus_fey','genus_heat','genus_polar','genus_sand','genus_demonic','genus_angelic','genus_synthetic'
    ],
    planet: [
        'explorer','biome_grassland','biome_oceanic','biome_forest','biome_desert','biome_volcanic','biome_tundra',
        'biome_savanna','biome_swamp','biome_ashland','biome_taiga','biome_hellscape','biome_eden',
        'atmo_toxic','atmo_mellow','atmo_rage','atmo_stormy','atmo_ozone','atmo_magnetic','atmo_trashed','atmo_elliptical','atmo_flare','atmo_dense',
        'atmo_unstable','atmo_permafrost','atmo_retrograde'
    ],
    universe: [
        'vigilante','squished','double_density','cross','macro','marble','heavyweight','whitehole','heavy','canceled',
        'eviltwin','microbang','pw_apocalypse','fullmetal','pass'
    ],
    challenge: [
        'joyless','steelen','dissipated','technophobe','wheelbarrow','iron_will','failed_history','banana','pathfinder',
        'ashanddust','exodus','obsolete','bluepill','retired','gross','lamentis','overlord',`adam_eve`
    ],
};

const flairData = {
    colonist: [flib('name')]
};

const descData = {
    trade: [750,50]
};

export const achievements = {};
Object.keys(achieve_list).forEach(function(type){
    achieve_list[type].forEach(achieve => achievements[achieve] = {
        name: loc(`achieve_${achieve}_name`),
        desc: descData[achieve] ? loc(`achieve_${achieve}_desc`,descData[achieve]) : loc(`achieve_${achieve}_desc`),
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
    banana: {
        name: loc("feat_banana_name"),
        desc: loc("feat_banana_desc",[500,500]),
        flair: loc("feat_banana_flair")
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
    digital_ascension: {
        name: loc("feat_digital_ascension_name"),
        desc: loc("feat_digital_ascension_desc"),
        flair: loc("feat_digital_ascension_flair")
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
    slime_lord: {
        name: loc("feat_slime_lord_name"),
        desc: loc("feat_slime_lord_desc"),
        flair: loc("feat_slime_lord_flair")
    },
    annihilation: {
        name: loc("feat_annihilation_name"),
        desc: loc("feat_annihilation_desc"),
        flair: loc("feat_annihilation_flair")
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
    launch_day: {
        name: loc("feat_launch_day_name"),
        desc: loc("feat_launch_day_desc"),
        flair: loc("feat_launch_day_flair")
    },
    solstice: {
        name: loc("feat_solstice_name"),
        desc: loc("feat_solstice_desc"),
        flair: loc("feat_solstice_flair")
    },
    firework: {
        name: loc("feat_firework_name"),
        desc: loc("feat_firework_desc"),
        flair: loc("feat_firework_flair")
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
    let al = universeLevel();
    set_alevel(al.aLvl);
    set_ulevel(al.uLvl);
}

export function universeLevel(universe){
    universe = universe || global.race.universe;
    let affix = universeAffix(universe);
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
    return { aLvl: lvl, uLvl: ulvl };
}

export function universeAffix(universe){
    universe = universe || global.race.universe;
    switch (universe){
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
    if (!global.settings.msgFilters.achievements.unlocked){
        global.settings.msgFilters.achievements.unlocked = true;
        global.settings.msgFilters.achievements.vis = true;
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
            messageQueue(loc(upgrade ? 'achieve_unlock_achieve_upgrade' : 'achieve_unlock_achieve', [achievements[achievement].name] ),'special',false,['achievements']);
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
                messageQueue(loc(i_upgrade ? 'achieve_unlock_achieve_icon_upgrade' : 'achieve_unlock_achieve_icon', [achievements[achievement].name] ),'special',false,['achievements']);
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
    if (!global.settings.msgFilters.achievements.unlocked){
        global.settings.msgFilters.achievements.unlocked = true;
        global.settings.msgFilters.achievements.vis = true;
    }
    let a_level = alevel();
    if (typeof rank === "undefined" || rank > a_level){
        rank = a_level;
    }
    if (!global.stats.feat[feat] || (global.stats.feat[feat] && global.stats.feat[feat] < rank)){
        let upgrade = global.stats.feat[feat] ? true : false;
        global.settings.showAchieve = true;
        global.stats.feat[feat] = rank;
        messageQueue(loc(upgrade ? 'feat_upgraded' : 'feat_unlocked', [feats[feat].name] ),'special',false,['achievements']);
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
    if ($(`body`).hasClass('fool')){
        drawAchieve({fool: true});
    }
    else {
        drawAchieve();
    }
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

    let trick = trickOrTreat(5,12,false);
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

export function challengeIcon(){
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

        let desc = '';
        if (global.race['no_plasmid']){ desc += `<div>${loc('evo_challenge_plasmid')}</div>`; }
        if (global.race['weak_mastery']){ desc += `<div>${loc('evo_challenge_mastery')}</div>`; }
        if (global.race['no_trade']){ desc += `<div>${loc('evo_challenge_trade')}</div>`; }
        if (global.race['no_craft']){ desc += `<div>${loc('evo_challenge_craft')}</div>`; }
        if (global.race['no_crispr']){ desc += `<div>${loc('evo_challenge_crispr')}</div>`; }
        if (global.race['nerfed']){ desc += `<div>${loc('evo_challenge_nerfed')}</div>`; }
        if (global.race['badgenes']){ desc += `<div>${loc('evo_challenge_badgenes')}</div>`; }

        if (desc.length > 0){
            $('#topBar .planetWrap .flair').append($(`<div class="is-sr-only"><div>Active Challenge Genes</div>${desc}</div>`));
        }

        popover('topbarPlanet',
            function(obj){
                let popper = $(`<div id="topbarPlanet"></div>`);
                obj.popper.append(popper);
                popper.append($(desc));
                return undefined;
            },
            {
                elm: `#topBar .planetWrap .flair`,
                classes: `has-background-light has-text-dark`
            }
        );
    }
}

export function alevel(){
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (global.race['nerfed']){ a_level++; }
    if (global.race['badgenes']){ a_level++; }
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
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass) >= 12){
        unlockAchieve('landfill');
    }
    if (global.interstellar['stellar_engine'] && (global.interstellar['stellar_engine'].mass) >= 100){
        unlockFeat('supermassive');
    }

    if (global.tech['piracy'] && global.tech['chthonian'] && global.tech['chthonian'] >= 2 && global.galaxy){
        if (piracy('gxy_stargate') === 1 && piracy('gxy_gateway') === 1 && piracy('gxy_gorddon') === 1 && piracy('gxy_alien1') === 1 && piracy('gxy_alien2') === 1 && piracy('gxy_chthonian') === 1){
            unlockAchieve('neutralized');
        }
    }

    if (eventActive('summer') && global.resource.hasOwnProperty('Thermite')){
        let thermite = 100000 + global.stats.reset * 9000;
        if (thermite > 1000000){ thermite = 1000000; }
        if (global.resource.Thermite.amount > thermite){
            unlockFeat('solstice',global.race.universe === 'micro' ? true : false);
        }
    }

    if (eventActive('firework') && global[global.race['cataclysm'] || global.race['orbit_decayed'] ? 'space' : 'city'].firework.on > 0){
        unlockFeat('firework',global.race.universe === 'micro' ? true : false);
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
    if (global.resource.hasOwnProperty('Money') && global.race['inflation'] && global.resource.Money.amount >= 250000000000){
        unlockAchieve('wheelbarrow');
    }

    if (global.civic.hasOwnProperty('govern') && global.galaxy.hasOwnProperty('trade') && global.city.hasOwnProperty('market') && global.galaxy.trade.cur >= 50 && global.city.market.trade >= 750 && global.civic.govern.type === 'federation'){
        unlockAchieve('trade');
    }

    if (global.tech['pillars']){
        let genus = {};
        let rCnt = 0;
        let equilRank = 5;
        Object.keys(global.pillars).forEach(function(race){                
            if (races[race]){
                if (race !== 'sludge'){
                    if (!genus[races[race].type] || global.pillars[race] > genus[races[race].type]){
                        genus[races[race].type] = global.pillars[race];
                    }
                    if (global.pillars[race] < equilRank){
                        equilRank = global.pillars[race];
                    }
                    rCnt++;
                }
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
        if (rCnt >= Object.keys(races).length - 2){
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

    if (global.race['banana']){
        let affix = universeAffix();
        if (global.tech.hasOwnProperty('monuments') && global.tech.monuments >= 50){
            global.stats.banana.b5[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.banana.b5.l = true;
            }
        }

        let slist = 0;
        let ulist = 0;
        ['b1','b2','b3','b4','b5'].forEach(function(b){
            if (global.stats.banana[b].l){
                slist++;
            }
            if (affix !== 'l' && global.stats.banana[b][affix]){
                ulist++;
            }
        });
        if (slist > 0){
            unlockAchieve('banana',false,slist,'l');
        }
        if (ulist > 0 && affix !== 'l'){
            unlockAchieve('banana',false,ulist,affix);
        }

        if (global.interstellar.hasOwnProperty('stellar_engine') && global.interstellar.stellar_engine.mass >= 12 && global.interstellar.stellar_engine.exotic === 0){
            global.stats.banana.b3[affix] = true;
            if (affix !== 'm' && affix !== 'l'){
                global.stats.banana.b3.l = true;
            }
        }
    }

    // Path Finder
    {
        let uAffix = universeAffix();
        ['l',uAffix].forEach(function (affix){
            let rank = 0;
            ['ashanddust','exodus','obsolete','bluepill','retired'].forEach(function (achieve){
                if (global.stats.achieve[achieve] && global.stats.achieve[achieve][affix] && global.stats.achieve[achieve][affix] >= 5){
                    rank++;
                }
            });
            if (rank > 0){
                unlockAchieve('pathfinder',false,rank,affix);
            }
        });
    }

    const date = new Date();
    let easter = eventActive('easter');
    let halloween = eventActive('halloween');
    let year = date.getFullYear();
    if (!global.settings.boring && date.getDate() === 13 && date.getDay() === 5 && global.resource[global.race.species].amount >= 1){
        let murder = false;
        murder = unlockFeat('friday',global.race.universe === 'micro' ? true : false);
        if (murder){
            global.resource[global.race.species].amount--;
        }
    }
    else if (!global.settings.boring && date.getMonth() === 1 && date.getDate() === 14){
        unlockFeat('valentine',global.race.universe === 'micro' ? true : false);
    }
    else if (!global.settings.boring && date.getMonth() === 2 && date.getDate() === 17){
        unlockFeat('leprechaun',global.race.universe === 'micro' ? true : false);
    }
    else if (easter.active){
        unlockFeat('easter',global.race.universe === 'micro' ? true : false);

        let eggs = 0;
        for (let i=1; i<=15; i++){
            if (global.special.egg[year][`egg${i}`]){
                eggs++;
            }
        }

        if (eggs >= 12){
            unlockFeat('egghunt',global.race.universe === 'micro' ? true : false);
        }
    }
    else if (eventActive('launch_day')){
        unlockFeat('launch_day',global.race.universe === 'micro' ? true : false);
    }
    else if (halloween.active){
        let total = 0;
        for (let i=1; i<=7; i++){
            if (global.special.trick[year][`trick${i}`]){
                total++;
            }
        }
        for (let i=1; i<=7; i++){
            if (global.special.trick[year][`treat${i}`]){
                total++;
            }
        }

        if (total >= 12){
            unlockFeat('trickortreat',global.race.universe === 'micro' ? true : false);
        }

        if (date.getMonth() === 9 && date.getDate() === 31){
            unlockFeat('halloween',global.race.universe === 'micro' ? true : false);
        }
    }
    else if (!global.settings.boring && date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28){
        unlockFeat('thanksgiving',global.race.universe === 'micro' ? true : false);
    }
    else if (!global.settings.boring && date.getMonth() === 11 && date.getDate() == 25){
        unlockFeat('xmas',global.race.universe === 'micro' ? true : false);
    }
    
    if (!global.settings.boring && date.getMonth() === 3 && date.getDate() >= 1 && date.getDate() <= 3 && global.stats.feat.hasOwnProperty('fool') && global.stats.feat.fool > 0){
        unlockFeat('fool',global.race.universe === 'micro' ? true : false);
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
                if (total >= progress[i].c && (!global.stats.feat[progress[i].f] || global.stats.feat[progress[i].f] < t_level)){
                    if (global.race.universe === 'micro'){
                        unlockFeat(progress[i].f,true,t_level);
                    }
                    else {
                        unlockFeat(progress[i].f,false,t_level);
                    }
                    calcQueueMax();
                    calcRQueueMax();
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
    mastery: {
        name: loc(`mastery`),
        desc(){
            let desc = '';
            Object.keys(universe_types).forEach(function(universe){
                let mastery = masteryType(universe,true);
                if (universe === 'standard'){
                    desc += `<span class="row"><span class="has-text-caution">${universe_types[universe].name}</span>: <span>${loc('perks_mastery_general',[`<span class="has-text-advanced">${+(mastery.g).toFixed(2)}%</span>`])}</span></span>`;
                }
                else if (global.stats.achieve['whitehole']){
                    desc += `<span class="row"><span class="has-text-caution">${universe_types[universe].name}</span>: <span>${loc('perks_mastery_general',[`<span class="has-text-advanced">${+(mastery.g).toFixed(2)}%</span>`])}, ${loc('perks_mastery_universe',[`<span class="has-text-advanced">${+(mastery.u).toFixed(2)}%</span>`])}</span></span>`;
                }
            });
            return desc;
        },
        active(){
            return global.genes['challenge'] && global.genes['challenge'] >= 2 ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_unlocked_title`)}</span>`]),
        ]
    },
    blackhole: {
        name: loc(`achieve_blackhole_name`),
        desc(wiki){
            let bonus = wiki ? "5/10/15/20/25" : global.stats.achieve['blackhole'] ? global.stats.achieve.blackhole.l * 5 : 5;
            return loc("achieve_perks_blackhole",[bonus]);
        },
        active(){
            return global.stats.achieve['blackhole'] && global.stats.achieve.blackhole.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_blackhole_name`)}</span>`])
        ]
    },
    trade: {
        name: loc(`achieve_trade_name`),
        desc(wiki){
            let bonus1 = wiki ? "2/4/6/8/10" : global.stats.achieve['trade'] ? global.stats.achieve.trade.l * 2 : 2;
            let bonus2 = wiki ? "1/2/3/4/5" : global.stats.achieve['trade'] ? global.stats.achieve.trade.l : 1;
            return loc("achieve_perks_trade",[bonus1,bonus2]);
        },
        active(){
            return global.stats.achieve['trade'] && global.stats.achieve.trade.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_trade_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_trade_name`)}</span>`])
        ]
    },
    creator: {
        name: loc(`achieve_creator_name`),
        desc(wiki){
            let bonus = wiki ? "1.5/2/2.5/3/3.5" : 1 + (global.stats.achieve['creator'] ? global.stats.achieve['creator'].l * 0.5 : 0.5);
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
                desc(wiki){
                    let rank = global.stats.achieve['mass_extinction'] ? global.stats.achieve.mass_extinction.l : 1;
                    let bonus = wiki ? "0/50/100/150/200" : (rank - 1) * 50;
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
    doomed: {
        name: loc(`achieve_doomed_name`),
        desc(wiki){
            return loc("achieve_perks_doomed");
        },
        active(){
            return global.stats.portals >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_doomed_name`)}</span>`])
        ]
    },
    explorer: {
        name: loc(`achieve_explorer_name`),
        desc(wiki){
            let bonus = wiki ? "1/2/3/4/5" : global.stats.achieve['explorer'] ? global.stats.achieve['explorer'].l : 1;
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
        desc(wiki){
            let numGeo = wiki ? "1/2/3/5/7" : global.stats.achieve['miners_dream'] ? global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l : 0;
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
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['joyless'] ? global.stats.achieve['joyless'].l * 2 : 2;
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
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['steelen'] ? global.stats.achieve['steelen'].l * 2 : 2;
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
    wheelbarrow: {
        name: loc(`achieve_wheelbarrow_name`),
        desc(wiki){
            let bonus = wiki ? "2/4/6/8/10" : global.stats.achieve['wheelbarrow'] ? global.stats.achieve['wheelbarrow'].l * 2 : 2;
            return loc("achieve_perks_wheelbarrow",[bonus]);
        },
        active(){
            return global.stats.achieve['wheelbarrow'] && global.stats.achieve.wheelbarrow.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_wheelbarrow_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_wheelbarrow_name`)}</span>`])
        ]
    },
    extinct_sludge: {
        name: loc(`achieve_extinct_sludge_name`),
        group: [
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].l * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_standard`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.l >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].h * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_heavy`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.h >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].a * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_antimatter`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.a >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].e * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_evil`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.e >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].m * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_micro`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.m >= 1 ? true : false;
                },
            },
            {
                desc(wiki){
                    let bonus = wiki ? "3/6/9/12/15" : (global.stats.achieve['extinct_sludge'] ? global.stats.achieve['extinct_sludge'].mg * 3 : 3);
                    return loc("achieve_perks_extinct_sludge",[bonus,loc(`universe_magic`)]);
                },
                active(){
                    return global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge.mg >= 1 ? true : false;
                },
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_extinct_sludge_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe_scale`,[`<span class="has-text-caution">${loc(`achieve_extinct_sludge_name`)}</span>`])
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
                desc(wiki){
                    let bonus = wiki ? "5/10/15/20/25" : global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l * 5 : 5;
                    return loc("achieve_perks_whitehole2",[bonus]);
                },
                active(){
                    return global.stats.achieve['whitehole'] ? true : false;
                }
            },
            {
                desc(wiki){
                    let bonus = wiki ? "1/2/3/4/5" : global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l : 1;
                    return loc("achieve_perks_whitehole3",[bonus]);
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
        desc(wiki){
            let bonus = wiki ? "4/8/12/16/20" : global.stats.achieve['heavyweight'] ? global.stats.achieve['heavyweight'].l * 4 : 4;
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
                desc(wiki){
                    let bonus = wiki ? "1/2" : global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 5 ? 2 : 1;
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
    banana: {
        name: loc(`achieve_banana_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_banana1",[50]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana2",[1]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana3",[10]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana4",[3]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_banana5",[0.01]);
                },
                active(){
                    return global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 5 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_banana_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task`,[`<span class="has-text-caution">${loc(`achieve_banana_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[1,`<span class="has-text-${global.stats.banana.b1.l ? `success` : `danger`}">${loc(`wiki_achieve_banana1`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[2,`<span class="has-text-${global.stats.banana.b2.l ? `success` : `danger`}">${loc(`wiki_achieve_banana2`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[3,`<span class="has-text-${global.stats.banana.b3.l ? `success` : `danger`}">${loc(`wiki_achieve_banana3`)}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[4,`<span class="has-text-${global.stats.banana.b4.l ? `success` : `danger`}">${loc(`wiki_achieve_banana4`,[500])}</span>`]),
            loc(`wiki_perks_achievement_note_task_num`,[5,`<span class="has-text-${global.stats.banana.b5.l ? `success` : `danger`}">${loc(`wiki_achieve_banana5`,[50])}</span>`])
        ]
    },
    anarchist: {
        name: loc(`achieve_anarchist_name`),
        desc(wiki){
            let bonus = wiki ? "10/20/30/40/50" : global.stats.achieve['anarchist'] ? global.stats.achieve['anarchist'].l * 10 : 10;
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
    ascended: {
        name: loc(`achieve_ascended_name`),
        group: [
            {
                desc(wiki){
                    let genes;
                    if (wiki){
                        genes = "1-30";
                    }
                    else {
                        genes = 0;
                        if (global.stats.achieve['ascended']){
                            for (let i=0; i<universe_affixes.length; i++){
                                if (global.stats.achieve.ascended.hasOwnProperty(universe_affixes[i])){
                                    genes += global.stats.achieve.ascended[universe_affixes[i]];
                                }
                            }
                        }
                    }
                    return loc("achieve_perks_ascended1",[genes]);
                },
                active(){
                    return global.stats.achieve['ascended'] && global.stats.achieve['ascended'].l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_ascended2",[harmonyEffect()]);
                },
                active(){
                    return global.stats.achieve['ascended'] && global.stats.achieve['ascended'][universeAffix()] >= 1 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_universe`,[`<span class="has-text-caution">${loc(`achieve_ascended_name`)}</span>`])
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
                desc(wiki){
                    let bonus;
                    if (wiki){
                        bonus = "10/25/30/35/40/45/50";
                    }
                    else {
                        bonus = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 4 ? 25 : 10;
                        for (let i=1; i<universe_affixes.length; i++){
                            if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                                bonus += 5;
                            }
                        }
                    }
                    return loc("achieve_perks_technophobe2",[bonus]);
                },
                active(){
                    return global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 2 ? true : false;
                }
            },
            {
                desc(wiki){
                    let gems;
                    if (wiki){
                        gems = "1/2/3/4/5/6";
                    }
                    else {
                        gems = 1;
                        for (let i=1; i<universe_affixes.length; i++){
                            if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                                gems += 1;
                            }
                        }
                    }
                    return wiki || gems > 1 ? loc("achieve_perks_technophobe3a",[gems]) : loc("achieve_perks_technophobe3",[gems]);
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
                desc(wiki){
                    let bonus = wiki ? "1/2/3/4/5" : global.stats.achieve['technophobe'] ? global.stats.achieve.technophobe.l : 0;
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
    lamentis: {
        name: loc(`achieve_lamentis_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_lamentis1",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis2",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis3",[`10%`]);
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis4");
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_lamentis5");
                },
                active(){
                    return global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 5 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_lamentis_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_lamentis_name`)}</span>`])
        ]
    },
    gladiator: {
        name: loc(`achieve_gladiator_name`),
        desc(wiki){
            let mech = wiki ? "20/40/60/80/100" : global.stats.achieve['gladiator'] ? global.stats.achieve.gladiator.l * 20 : 20;
            return loc("achieve_perks_gladiator",[mech]);
        },
        active(){
            return global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l >= 1 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_scale`,[`<span class="has-text-caution">${loc(`achieve_gladiator_name`)}</span>`])
        ]
    },
    pathfinder: {
        name: loc(`achieve_pathfinder_name`),
        group: [
            {
                desc(){
                    return loc("achieve_perks_pathfinder1",[10]);
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 1 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder2",[10]);
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder3");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 3 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder4");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4 ? true : false;
                }
            },
            {
                desc(){
                    return loc("achieve_perks_pathfinder5");
                },
                active(){
                    return global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 5 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_pathfinder_name`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder`,[`<span class="has-text-caution">${loc(`evo_challenge_truepath`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['ashanddust'] ? 'success' : 'danger'}">${loc(`wiki_resets_mad`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['exodus'] ? 'success' : 'danger'}">${loc(`wiki_resets_bioseed`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['obsolete'] ? 'success' : 'danger'}">${loc(`wiki_resets_ai`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['bluepill'] ? 'success' : 'danger'}">${loc(`wiki_resets_matrix`)}</span>`]),
            loc(`wiki_perks_achievement_note_pathfinder_reset`,[`<span class="has-text-${global.stats.achieve['retired'] ? 'success' : 'danger'}">${loc(`wiki_resets_retired`)}</span>`]),
        ]
    },
    overlord: {
        name: loc(`achieve_overlord_name`),
        desc(){
            let desc = `<div>${loc("achieve_perks_overlord1",[10])}</div>`;
            desc += `<div>${loc("achieve_perks_overlord2")}</div>`;
            desc += `<div>${loc("achieve_perks_overlord3")}</div>`;
            desc += `<div>${loc("achieve_perks_overlord4")}</div>`;
            return desc;
        },
        active(){
            return global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? true : false;
        },
        notes: [
            loc(`wiki_perks_achievement_note`,[`<span class="has-text-caution">${loc(`achieve_overlord_name`)}</span>`]),
        ]
    },
    adam_eve: {
        name: loc(`achieve_adam_eve_name`),
        desc(){
            return loc(`achieve_perks_adam_eve`);
        },
        active(){
            return global.stats.achieve['adam_eve'] && global.stats.achieve.adam_eve.l >= 5 ? true : false;
        },
        notes: []
    },
    creep: {
        name: loc(`wiki_arpa_crispr_creep`),
        desc(wiki){
            let bonus = wiki ? "0.01/0.02/0.03/0.04/0.05" : global.genes['creep'] ? global.genes.creep * 0.01 : 0;
            return loc("arpa_perks_creep",[bonus]);
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
        desc(wiki){
            let psb = wiki ? "0.04/0.06/0.08" : global.genes['store'] && global.genes.store > 1 ? (global.genes.store === 2 ? 0.06 : 0.08) : 0.04;
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
                desc(wiki){
                    let bonus = wiki ? "50/100" : global.genes['crafty'] && global.genes.crafty >= 3 ? 100 : 50;
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
    governor: {
        name: loc(`wiki_arpa_crispr_governor`),
        desc(){
            return loc("arpa_perks_governor");
        },
        active(){
            return global.genes['governor'] ? true : false;
        },
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_governance_title`)}</span>`])
        ]
    },
    synthesis: {
        name: loc(`wiki_arpa_crispr_synthesis`),
        desc(wiki){
            let base = wiki ? "2/3/4" : global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 4 : 3) : 2;
            let auto = wiki ? "10/25/50" : global.genes['synthesis'] && global.genes['synthesis'] >= 2 ? (global.genes['synthesis'] >= 3 ? 50 : 25) : 10;
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
                desc(wiki){
                    return loc("arpa_perks_challenge2",[
                        wiki ? "60/80" : global.genes['challenge'] && global.genes.challenge >= 4 ? 80 : 60,
                        wiki ? "60/40" : global.genes['challenge'] && global.genes.challenge >= 4 ? 40 : 60
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
            ]),
            loc(`wiki_perks_crispr_note_challenge`,[loc(`arpa_genepool_universal_title`),loc(`arpa_genepool_standard_title`)])
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
                desc(wiki){
                    return loc("arpa_perks_ancients4",[wiki ? "25/50" : global.genes['ancients'] && global.genes.ancients >= 5 ? 50 : 25]);
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
        desc(wiki){
            let plasmid_cap = wiki ? "3/5" : global.genes['plasma'] >= 2 ? 5 : 3;
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
    blood: {
        name: loc(`wiki_arpa_crispr_blood`),
        group: [
            {
                desc(){
                    return loc("arpa_genepool_blood_remembrance_desc");
                },
                active(){
                    return global.genes['blood'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_blood_sacrifice_desc");
                },
                active(){
                    return global.genes['blood'] && global.genes.blood >= 2 ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_genepool_essence_absorber_desc");
                },
                active(){
                    return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_crispr_note`,[`<span class="has-text-caution">${loc(`arpa_genepool_blood_remembrance_title`)}</span>`]),
            loc(`wiki_perks_crispr_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_genepool_blood_sacrifice_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_genepool_essence_absorber_title`)}</span>`
                ].join(', ')
            ]),
            loc(`wiki_perks_crispr_note_blood`,[loc(`arpa_genepool_blood_remembrance_title`)])
        ]
    },
    spire: {
        name: loc(`wiki_arpa_blood_spire`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_purify_desc");
                },
                active(){
                    return global.blood['spire'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_chum_desc");
                },
                active(){
                    return global.blood['spire'] && global.blood.spire >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_purify_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_chum_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    lust: {
        name: loc(`wiki_arpa_blood_lust`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_lust",[wiki ? 0.2 : 0.2 * (global.blood['lust'] ? global.blood['lust'] : 1)]);
                },
                active(){
                    return global.blood['lust'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_lust_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_lust_title`)])
        ]
    },
    illuminate: {
        name: loc(`wiki_arpa_blood_illuminate`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_illuminate",[wiki ? 0.01 : 0.01 * (global.blood['illuminate'] ? global.blood['illuminate'] : 1)]);
                },
                active(){
                    return global.blood['illuminate'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_illuminate_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_illuminate_title`)])
        ]
    },
    greed: {
        name: loc(`wiki_arpa_blood_greed`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_greed",[wiki ? 1 : 1 * (global.blood['greed'] ? global.blood['greed'] : 1)]);
                },
                active(){
                    return global.blood['greed'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_greed_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_greed_title`)])
        ]
    },
    hoarder: {
        name: loc(`wiki_arpa_blood_hoarder`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_hoarder",[wiki ? 1 : 1 * (global.blood['hoarder'] ? global.blood['hoarder'] : 1)]);
                },
                active(){
                    return global.blood['hoarder'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_hoarder_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_hoarder_title`)])
        ]
    },
    artisan: {
        name: loc(`wiki_arpa_blood_artisan`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_artisan",[wiki ? 1 : 1 * (global.blood['artisan'] ? global.blood['artisan'] : 1)]);
                },
                active(){
                    return global.blood['artisan'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_artisan_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_artisan_title`)])
        ]
    },
    attract: {
        name: loc(`wiki_arpa_blood_attract`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_attract",[wiki ? 5 : 5 * (global.blood['attract'] ? global.blood['attract'] : 1)]);
                },
                active(){
                    return global.blood['attract'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_attract_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_attract_title`)])
        ]
    },
    wrath: {
        name: loc(`wiki_arpa_blood_wrath`),
        group: [
            {
                desc(wiki){
                    return loc("arpa_perks_wrath",[wiki ? 5 : 5 * (global.blood['wrath'] ? global.blood['wrath'] : 1)]);
                },
                active(){
                    return global.blood['wrath'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_wrath_title`)}</span>`]),
            loc(`wiki_perks_blood_note_repeat`,[loc(`arpa_blood_wrath_title`)])
        ]
    },
    prepared: {
        name: loc(`wiki_arpa_blood_prepared`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_prepared_desc");
                },
                active(){
                    return global.blood['prepared'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_compact_desc");
                },
                active(){
                    return global.blood['prepared'] && global.blood.prepared >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_prepared_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_compact_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    unbound: {
        name: loc(`wiki_arpa_blood_unbound`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_unbound_desc");
                },
                active(){
                    return global.blood['unbound'] ? true : false;
                }
            },
            {
                desc(){
                    return loc("arpa_blood_shadow_war_desc");
                },
                active(){
                    return global.blood['unbound'] && global.blood.unbound >= 3 ? true : false;
                }
            },
            {
                desc(wiki){
                    return loc("arpa_perks_unbound_resist",[wiki ? "10/5" : global.blood['unbound'] && global.blood.unbound >= 4 ? 5 : 10]);
                },
                active(){
                    return global.blood['unbound'] && global.blood.unbound >= 2 ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_unbound_title`)}</span>`]),
            loc(`wiki_perks_blood_note_upgrade`,[ 
                [
                    `<span class="has-text-caution">${loc(`arpa_blood_unbound_resistance_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_blood_shadow_war_title`)}</span>`,
                    `<span class="has-text-caution">${loc(`arpa_blood_unbound_immunity_title`)}</span>`
                ].join(', ')
            ])
        ]
    },
    aware: {
        name: loc(`wiki_arpa_blood_aware`),
        group: [
            {
                desc(){
                    return loc("arpa_blood_blood_aware_desc");
                },
                active(){
                    return global.blood['aware'] ? true : false;
                }
            }
        ],
        notes: [
            loc(`wiki_perks_blood_note`,[`<span class="has-text-caution">${loc(`arpa_blood_blood_aware_title`)}</span>`])
        ]
    },
    harmonic: {
        name: loc(`harmonic`),
        group: [
            {
                desc(wiki){
                    let harmonic = calcPillar();
                    return loc("perks_harmonic",[wiki ? `1-${Object.keys(races).length + 2}` : +((harmonic[0] - 1) * 100).toFixed(0), wiki ? `2-${(Object.keys(races).length + 2) * 2}` : +((harmonic[1] - 1) * 100).toFixed(0)]);
                },
                active(){
                    let harmonic = calcPillar();
                    return global['pillars'] && harmonic[0] > 1 ? true : false;
                }
            },
            {
                desc(wiki){
                    let harmonic = calcPillar();
                    return loc("perks_harmonic2",[loc("portal_west_tower"), loc("portal_east_tower"), wiki ? `12-${(Object.keys(races).length - 1) * 12}` : +(Object.keys(global.pillars).length * 12)]);
                },
                active(){
                    let harmonic = calcPillar();
                    return global['pillars'] && harmonic[0] > 1 ? true : false;
                }
            },
        ],
        notes: [
            loc(`wiki_perks_harmonic_note1`),
            loc(`wiki_perks_harmonic_note2`)
        ]
    },
    novice: {
        name: loc(`perk_novice`),
        desc(wiki){
            let rank = global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0 ? Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']) : 1;
            let rna = wiki ? "0.5/1/1.5/2/2.5" : rank / 2;
            let dna = wiki ? "0.25/0.5/0.75/1/1.25" : rank / 4;
            return `<div>${loc("achieve_perks_novice",[rna,dna])}</div><div>${loc("achieve_perks_novice2")}</div>`;
        },
        active(){
            return global.stats.feat['novice'] && global.stats.mad > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[10,loc(`wiki_resets_mad`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    journeyman: {
        name: loc(`perk_journeyman`),
        desc(wiki){
            let rank = global.stats.feat['journeyman'] && global.stats.achieve['seeder'] && global.stats.achieve.seeder.l > 0 ? Math.min(global.stats.achieve.seeder.l,global.stats.feat['journeyman']) : 1;
            if (wiki || rank > 1){
                let rqueue = wiki ? "1/2/3" : rank >= 3 ? (rank >= 5 ? 3 : 2) : 1;
                let queue = wiki ? "1/2" : rank >= 4 ? 2 : 1;
                return `<div>${loc("achieve_perks_journeyman2",[rqueue,queue])}</div><div>${loc("achieve_perks_journeyman3")}</div>`;
            }
            else {
                return `<div>${loc("achieve_perks_journeyman1",[1])}</div><div>${loc("achieve_perks_journeyman3")}</div>`;
            }
        },
        active(){
            return global.stats.feat['journeyman'] && global.stats.bioseed > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[25,loc(`wiki_resets_bioseed`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    adept: {
        name: loc(`perk_adept`),
        desc(wiki){
            let rank = global.stats.feat['adept'] && global.stats.achieve['whitehole'] && global.stats.achieve.whitehole.l > 0 ? Math.min(global.stats.achieve.whitehole.l,global.stats.feat['adept']) : 1;
            let res = wiki ? "100/200/300/400/500" : rank * 100;
            let cap = wiki ? "60/120/180/240/300" : rank * 60;
            return loc("achieve_perks_adept",[res,cap]);
        },
        active(){
            return global.stats.feat['adept'] && global.stats.achieve['whitehole'] && global.stats.achieve.whitehole.l > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[50,loc(`wiki_resets_blackhole`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    master: {
        name: loc(`perk_master`),
        desc(wiki){
            let rank = global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? Math.min(global.stats.achieve.ascended.l,global.stats.feat['master']) : 1;
            let boost1 = wiki ? "1/2/3/4/5" : rank;
            let boost2 = wiki ? "2/4/6/8/10" : rank * 2;
            return loc("achieve_perks_master",[boost1,boost2,loc('evo_mitochondria_title'),loc('evo_eukaryotic_title'),loc('evo_membrane_title'),loc('evo_organelles_title'),loc('evo_nucleus_title')]);
        },
        active(){
            return global.stats.feat['master'] && global.stats.achieve['ascended'] && global.stats.achieve.ascended.l > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[75,loc(`wiki_resets_ascension`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
    grandmaster: {
        name: loc(`perk_grandmaster`),
        desc(wiki){
            let rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 1;
            let boost = wiki ? "1/2/3/4/5" : rank;
            return loc("achieve_perks_grandmaster",[boost]);
        },
        active(){
            return global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? true : false;
        },
        notes: [
            loc(`wiki_perks_progress_note1`,[100,loc(`wiki_resets_infusion`)]),
            loc(`wiki_perks_progress_note2`)
        ]
    },
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

    // Overall Stats
    stats.append(`<div><span class="has-text-success">${loc("achieve_stats_overall")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_plasmid_earned")}</span> {{ s.plasmid | format }}</div>`);
    if (global.stats.antiplasmid > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_antiplasmid_earned")}</span> {{ s.antiplasmid | format }}</div>`);
    }
    if (global.stats.phage > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_phage_earned")}</span> {{ s.phage | format }}</div>`);
    }
    if (global.stats.dark > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_dark_earned")}</span> {{ s.dark | format }}</div>`);
    }
    if (global.stats.harmony > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_harmony_earned")}</span> {{ s.harmony | format }}</div>`);
    }
    if (global.stats.blood > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blood_earned")}</span> {{ s.blood | format }}</div>`);
    }
    if (global.stats.artifact > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_artifact_earned")}</span> {{ s.artifact | format }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ s.know | t_know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ s.starved | t_starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ s.died | t_died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ s.days | played | format }}</div>`);
    if (global.stats.portals > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_portals")}</span> {{ s.portals | format }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_total_resets")}</span> {{ s.reset | format }}</div>`);
    if (global.stats.mad > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_mad_resets")}</span> {{ s.mad | format }}</div>`);
    }
    if (global.stats.bioseed > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_bioseed_resets")}</span> {{ s.bioseed | format }}</div>`);
    }
    if (global.stats.cataclysm > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_cataclysm_resets")}</span> {{ s.cataclysm | format }}</div>`);
    }
    if (global.stats.blackhole > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blackhole_resets")}</span> {{ s.blackhole | format }}</div>`);
    }
    if (global.stats.ascend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_ascension_resets")}</span> {{ s.ascend | format }}</div>`);
    }
    if (global.stats.descend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_descension_resets")}</span> {{ s.descend | format }}</div>`);
    }
    if (global.stats.aiappoc > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_aiappoc_resets")}</span> {{ s.aiappoc | format }}</div>`);
    }
    if (global.stats.matrix > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_matrix_resets")}</span> {{ s.matrix | format }}</div>`);
    }
    if (global.stats.retire > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_retire_resets")}</span> {{ s.retire | format }}</div>`);
    }
    if (global.stats.eden > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_eden_resets")}</span> {{ s.eden | format }}</div>`);
    }
    if (global.stats.terraform > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_terraform_resets")}</span> {{ s.terraform | format }}</div>`);
    }
    if (global.stats.geck > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_gecks")}</span> {{ s.geck | format }}</div>`);
    }

    // Current Run Stats
    stats.append(`<div class="cstat"><span class="has-text-success">${loc("achieve_stats_current_game")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ s.know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ s.starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ s.died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_attacks_made")}</span> {{ s.attacks | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ s.days | format }}</div>`);
    if (global.stats.dkills > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_demons_kills")}</span> {{ s.dkills | format }}</div>`);
    }
    if (global.stats.sac > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_sacrificed")}</span> {{ s.sac | format }}</div>`);
    }
    if (global.resource.hasOwnProperty('Thermite') && global.resource.Thermite.amount > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_thermite")}</span> {{ r.Thermite.amount | res }}</div>`);
    }

    let hallowed = getHalloween();
    if (hallowed.active){
        let trick = '';
        if (global.stats.cfood >= 13 || global.race['cataclysm'] || global.race['orbit_decayed']){
            trick = `<span>${trickOrTreat(7,12,true)}</span>`;
        }
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_trickortreat")}</span> {{ s.cfood | format }} ${trick}</div>`);
    }

    vBind({
        el: '#statsPanel',
        data: {
            s: global.stats,
            r: global.resource,
        },
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
            },
            res(r){
                return (+(r).toFixed(2)).toLocaleString();
            }
        }
    });
}
