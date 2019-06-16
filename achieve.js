import { global, vues, messageQueue } from './vars.js';

if (!global.stats['achieve']){
    global.stats['achieve'] = {};
}

var achievements = {
    apocalypse: {
        name: `Apocalypse`,
        desc: `Wiped yourself out with nuclear weapons`,
        flair: `The vaults didn't help`
    },
    second_evolution: {
        name: `Second Evolution`,
        desc: `Evolve the same species twice in a row and then worship your ancestors.`,
        flair: `Coincidence or ancient hubris?`
    },
    blackhole: {
        name: `Blackhole? No hole`,
        desc: `Didn't destroy your planet with an artifical blackhole`,
        flair: `Science 1, Fearmongers 0`
    },
    warmonger: {
        name: `Heir of Genghis Khan`,
        desc: `Have a warmonger penalty of 8% or more.`,
        flair: `What is best in life? to see your enemies fall before you.`
    },
    red_tactics: {
        name: `Red Tactician`,
        desc: `Lose 250 soldiers in a single game`,
        flair: `Not one step backwards.`
    },
    pacifist: {
        name: `Pacifist`,
        desc: `Reset the game without losing any soliders in your current game`,
        flair: `Make love not war.`
    },
    madagascar_tree: {
        name: `Madagascar Tree`,
        desc: `Evolved nightmarish flesh eating trees`,
        flair: `Audrey III`
    },
    mass_starvation: {
        name: `Great Leap Backwards`,
        desc: `Have 100 citizens starve to death in a single game`,
        flair: `Was Mao your mentor?`
    },
    colonist: {
        name: `Space Colonist`,
        desc: `Colonize another planet`,
        flair: `That's one small step for a ${global.race.species}...`
    },
    world_domination: {
        name: `World Domination`,
        desc: `Conquered the world through military force`,
        flair: `All those games of RISK finally paid off`
    },
    illuminati: {
        name: `Illuminati`,
        desc: `Seized control of the world through influential dominance`,
        flair: `To rule from the shadows`
    },
    syndicate: {
        name: `Syndicate`,
        desc: `Used your wealth to execute a hostile takeover of the world`,
        flair: `Caveat emptor`
    },
    cult_of_personality: {
        name: `Cult of Personality`,
        desc: `Inspired your people with your leadership abilities`,
        flair: `What is steel compared to the hand that wields it?`
    },
    doomed: {
        name: `Doomed`,
        desc: `Stopped an invasion from hell`,
        flair: `Shoot it until it dies`
    },
    seeder: {
        name: `Seeder`,
        desc: `Bioseed an alien world`,
        flair: `What is god if not us?`
    },
    biome_grassland: {
        name: `Grassland Civilizer`,
        desc: `Successfully built a civilization on a grassland planet`,
        flair: `A garden world of your own design`
    },
    biome_oceanic: {
        name: `Oceanic Civilizer`,
        desc: `Successfully built a civilization on an oceanic planet`,
        flair: `A blue gem floating in the cosmos`
    },
    biome_forest: {
        name: `Forest Civilizer`,
        desc: `Successfully built a civilization on a forest planet`,
        flair: `A forest paradise for those of your choosing`
    },
    biome_desert: {
        name: `Desert Civilizer`,
        desc: `Successfully built a civilization on a desert planet`,
        flair: `Tamed the unforgiving desert and made it your own`
    },
    biome_volcanic: {
        name: `Volcanic Civilizer`,
        desc: `Successfully built a civilization on a volcanic planet`,
        flair: `Master of the prodromal world`
    },
    biome_tundra: {
        name: `Tundra Civilizer`,
        desc: `Successfully built a civilization on a tundra planet`,
        flair: `The cold never bothered you anyway`
    },
    genus_humanoid: {
        name: `Humanoid Victus`,
        desc: `Led a humanoid civilization to greatness`,
        flair: `Seized your place among the stars`
    },
    genus_animal: {
        name: `Scent of a Star`,
        desc: `Led a animal civilization to greatness`,
        flair: `Tracked a star and left your mark`
    },
    genus_small: {
        name: `Tiny Supremacy`,
        desc: `Led a small civilization to greatness`,
        flair: `You proved that size doesn't matter`
    },
    genus_giant: {
        name: `It's Always Bigger`,
        desc: `Led a giant civilization to greatness`,
        flair: `You proved that size does matter`
    },
    genus_reptilian: {
        name: `Flew to the Sun`,
        desc: `Led a reptilian civilization to greatness`,
        flair: `Never left out in the cold again`
    },
    genus_avian: {
        name: `Souring Above`,
        desc: `Led an avian civilization to greatness`,
        flair: `Even flightless birds can fly`
    },
    genus_insectoid: {
        name: `Superior Numbers`,
        desc: `Led an insectoid civilization to greatness`,
        flair: `It's a numbers game`
    },
    genus_plant: {
        name: `Growing Unchecked`,
        desc: `Led an plant civilization to greatness`,
        flair: `Outgrew your soil`
    },
    genus_fungi: {
        name: `Spores in the Wind`,
        desc: `Led an fungi civilization to greatness`,
        flair: `Spread everywhere, even the stars`
    },
    mass_extinction: {
        name: `Mass Extinction`,
        desc: `Led all civilizations to destruction`,
        flair: `Cosmic rays have got nothing on you`
    },
    extinct_human: {
        name: `Homo Adeadus`,
        desc: `Led a human civilization to destruction`,
        flair: `Homo Erectus? More like Homo Flacidus`
    },
    extinct_elven: {
        name: `The few, the proud, the dead`,
        desc: `Led an elven civilization to destruction`,
        flair: `Now they can help the trees as fertilizer`
    },
    extinct_orc: {
        name: `Outlander`,
        desc: `Led an orc civilization to destruction`,
        flair: `Went out in a blaze of glory`
    },
    extinct_cath: {
        name: `Saber Tooth Tiger`,
        desc: `Led a cath civilization to destruction`,
        flair: `Scratched their last post`
    },
    extinct_wolven: {
        name: `Dire Wolf`,
        desc: `Led a wolven civilization to destruction`,
        flair: `The moon will be lonely`
    },
    extinct_centaur: {
        name: `Ferghana`,
        desc: `Led a centaur civilization to destruction`,
        flair: `Just dust in the wind`
    },
    extinct_kobold: {
        name: `Took their candle`,
        desc: `Led a kobold civilization to destruction`,
        flair: `It didn't smell very good`
    },
    extinct_goblin: {
        name: `Greed before Need`,
        desc: `Led a goblin civilization to destruction`,
        flair: `Too cheap for tombstones`
    },
    extinct_gnome: {
        name: `Unathletic`,
        desc: `Led a gnome civilization to destruction`,
        flair: `Couldn't outrun the bombs`
    },
    extinct_orge: {
        name: `Too stupid to live`,
        desc: `Led an ogre civilization to destruction`,
        flair: `Darwin would be proud`
    },
    extinct_cyclops: {
        name: `Blind Ambition`,
        desc: `Led a cyclops civilization to destruction`,
        flair: `Lost an eye and didn't have a spare`
    },
    extinct_troll: {
        name: `Bad Juju`,
        desc: `Led a troll civilization to destruction`,
        flair: `Paid the final toll`
    },
    extinct_tortoisan: {
        name: `Circle of Life`,
        desc: `Led a tortoisan civilization to destruction`,
        flair: `A turtle didn't make it to the water`
    },
    extinct_gecko: {
        name: `No Savings`,
        desc: `Led a gecko civilization to destruction`,
        flair: `The rates weren't that good afterall`
    },
    extinct_slitheryn: {
        name: `Final Shedding`,
        desc: `Led a slitheryn civilization to destruction`,
        flair: `Choked on the apple`
    },
    extinct_arraak: {
        name: `Way of the Dodo`,
        desc: `Led an arraak civilization to destruction`,
        flair: `Tastes like chicken`
    },
    extinct_pterodacti: {
        name: `Chicxulub`,
        desc: `Led a pterodacti civilization to destruction`,
        flair: `Just couldn't adapt`
    },
    extinct_dracnid: {
        name: `Desolate Smaug`,
        desc: `Led a dracnid civilization to destruction`,
        flair: `The forever lonely mountain`
    },
    extinct_entish: {
        name: `Saruman's Revenge`,
        desc: `Led an entish civilization to destruction`,
        flair: `Ripped them all down`
    },
    extinct_cacti: {
        name: `Desert Deserted`,
        desc: `Led a cacti civilization to destruction`,
        flair: `The oasis was a mirage`
    },
    extinct_sporgar: {
        name: `Fungicide`,
        desc: `Led a sporgar civilization to destruction`,
        flair: `The oil of the future`
    },
    extinct_shroomi: {
        name: `Bad Trip`,
        desc: `Led a shroomi civilization to destruction`,
        flair: `Shouldn't have eaten that`
    },
    extinct_mantis: {
        name: `Praying Unanswered`,
        desc: `Led a mantis civilization to destruction`,
        flair: `Maybe next time they'll be listening`
    },
    extinct_scorpid: {
        name: `Pulmonoscorpius`,
        desc: `Led a scorpid civilization to destruction`,
        flair: `Owl supremacy`
    },
    extinct_antid: {
        name: `Ophiocordyceps Unilateralis`,
        desc: `Led an antid civilization to destruction`,
        flair: `Walked off into history`
    }
};

export function unlockAchieve(achievement){
    if (!global.stats.achieve[achievement]){
        global.settings.showAchieve = true;
        global.stats.achieve[achievement] = true;
        messageQueue(`Achievement Unlocked! ${achievements[achievement].name}`,'special');
        drawAchieve();
        return true;
    }
    return false;
}

export function setupStats(){
    $('#achieve').empty();
    let stats = $('<div id="statsPanel"></div>');
    $('#achieve').append(stats);
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    drawStats();
    drawAchieve();
}

export function drawAchieve(){
    if (vues['vue_achieve']){
        vues['vue_achieve'].$destroy();
    }

    $('#achievePanel').empty();
    let achieve = $('#achievePanel');
    let earned = 0;
    let total = 0;
    Object.keys(achievements).forEach(function (achievement){
        total++;
        if (global.stats.achieve[achievement]){
            earned++;
            achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span></div></b-tooltip>`));
        }
    });
    achieve.prepend(`<div class="has-text-warning">Achievements Earned: ${earned} of ${total}</div>`);

    let avue = {
        methods: {
            flair(flair){
                return achievements[flair].flair;
            }
        }
    }
    
    vues['vue_achieve'] = new Vue(avue);
    vues['vue_achieve'].$mount('#achievePanel');
}

export function checkAchievements(){
    if (!global.stats.achieve['mass_extinction']){
        let check = true;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes('extinct_')){
                if (!global.stats.achieve[key]){
                    check = false;
                    break;
                }
            }
        }
        if (check){
            unlockAchieve('mass_extinction');
        }
    }
    if (!global.stats.achieve['blackhole'] && global.tech['supercollider'] && global.tech['supercollider'] >= 99){
        unlockAchieve('blackhole');
    }
    if (!global.stats.achieve['mass_starvation'] && global.stats.starved >= 100){
        unlockAchieve('mass_starvation');
    }
    if (!global.stats.achieve['warmonger'] && Math.round(Math.log2(global.civic.garrison.protest + global.civic.garrison.fatigue) >= 8)){
        unlockAchieve('warmonger');
    }
    if (!global.stats.achieve['red_tactics'] && global.stats.died >= 250){
        unlockAchieve('red_tactics');
    }
}

export function drawStats(){
    if (vues['vue_stats']){
        vues['vue_stats'].$destroy();
    }

    $('#statsPanel').empty();
    let stats = $('#statsPanel');
    
    stats.append(`<div><span class="has-text-success">Overall</span></div>`);
    stats.append(`<div><span class="has-text-warning">Plasmids Earned:</span> {{ plasmid }}</div>`);
    stats.append(`<div><span class="has-text-warning">Knowledge Spent:</span> {{ know | t_know }}</div>`);
    stats.append(`<div><span class="has-text-warning">Starved to Death:</span> {{ starved | t_starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">Died in Combat:</span> {{ died | t_died }}</div>`);
    stats.append(`<div><span class="has-text-warning">Game Days Played:</span> {{ days | played }}</div>`);
    stats.append(`<div><span class="has-text-warning">Total Resets:</span> {{ reset }}</div>`);
    stats.append(`<div class="cstat"><span class="has-text-success">Current Game</span></div>`);
    stats.append(`<div><span class="has-text-warning">Knowledge Spent:</span> {{ know }}</div>`);
    stats.append(`<div><span class="has-text-warning">Starved to Death:</span> {{ starved }}</div>`);
    stats.append(`<div><span class="has-text-warning">Died in Combat:</span> {{ died }}</div>`);
    stats.append(`<div><span class="has-text-warning">Game Days Played:</span> {{ days }}</div>`);

    let svue = {
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
            }
        }
    }
    
    vues['vue_stats'] = new Vue(svue);
    vues['vue_stats'].$mount('#statsPanel');
}
