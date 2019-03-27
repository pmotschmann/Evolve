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
        desc: `Led an orge civilization to destruction`,
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
    },
    mass_extinction: {
        name: `Mass Extinction`,
        desc: `Led all civilizations to destruction`,
        flair: `Cosmic rays have got nothing on you`
    }
};

export function unlockAchieve(achievement){
    if (!global.stats.achieve[achievement]){
        global.settings.showAchieve = true;
        global.stats.achieve[achievement] = true;
        messageQueue(`Achievement Unlocked! ${achievements[achievement].name}`,'special');
        drawAchieve();
    }
}

export function drawAchieve(){
    if (vues['vue_achieve']){
        vues['vue_achieve'].$destroy();
    }

    $('#achieve').empty();
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    let earned = 0;
    let total = 0;
    Object.keys(achievements).forEach(function (achievement){
        total++;
        if (global.stats.achieve[achievement]){
            earned++;
            achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span></div></b-tooltip>`));
        }
    });
    achieve.prepend(`<div class="has-text-warning">Achivements Earned: ${earned} of ${total}</div>`);

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
}
