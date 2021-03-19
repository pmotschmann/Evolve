import { global } from './vars.js';
import { races } from './races.js';
import { loc } from './locale.js';

const gmen = {
    soldier: {
        name: loc('governor_soldier'),
        title: [loc('governor_soldier_t1'),loc('governor_soldier_t2'),loc('governor_soldier_t3')],
        traits: {
            tactician: 1,
            militant: 1
        }
    },
    criminal: {
        name: loc('governor_criminal'),
        title: [loc('governor_criminal_t1'),loc('governor_criminal_t2'),{ m: loc('governor_criminal_t3m'), f: loc('governor_criminal_t3f') }],
        traits: {
            noquestions: 1,
            racketeer: 1
        }
    },
    entrepreneur: {
        name: loc('governor_entrepreneur'),
        title: [loc('governor_entrepreneur_t1'),loc('governor_entrepreneur_t2'),{ m: loc('governor_entrepreneur_t3m'), f: loc('governor_entrepreneur_t3f') }],
        traits: {
            dealmaker: 1,
            risktaker: 1
        }
    },
    educator: {
        name: loc('governor_educator'),
        title: [loc('governor_educator_t1'),loc('governor_educator_t2'),loc('governor_educator_t3')],
        traits: {
            teacher: 1
        }
    },
    spiritual: {
        name: loc('governor_spiritual'),
        title: [loc('governor_educator_t1'),loc('governor_spiritual_t2'),loc('governor_spiritual_t3')],
    },
    bluecollar: {
        name: loc('governor_bluecollar'),
        title: [{ m: loc('governor_bluecollar_t1m'), f: loc('governor_bluecollar_t1f') },loc('governor_bluecollar_t2'),{ m: loc('governor_bluecollar_t3m'), f: loc('governor_bluecollar_t3f') }],
    },
    noble: {
        name: loc('governor_noble'),
        title: [{ m: loc('governor_noble_t1m'), f: loc('governor_noble_t1f') },{ m: loc('governor_noble_t2m'), f: loc('governor_noble_t2f') },{ m: loc('governor_noble_t3m'), f: loc('governor_noble_t3f') },{ m: loc('governor_noble_t4m'), f: loc('governor_noble_t4f') }],
        traits: {
            extravagant: 1,
            respected: 1
        }
    },
    media: {
        name: loc('governor_media'),
        title: [loc('governor_media_t1'),{ m: loc('governor_media_t2m'), f: loc('governor_media_t2f') },loc('governor_media_t3')],
        traits: {
            gaslighter: 1,
            renowned: 1
        }
    },
    sports: {
        name: loc('governor_sports'),
        title: [loc('governor_sports_t1'),loc('governor_sports_t2'),loc('governor_sports_t3')],
    },
    bureaucrat: {
        name: loc('governor_bureaucrat'),
        title: [loc('governor_bureaucrat_t1'),{ m: loc('governor_bureaucrat_t2m'), f: loc('governor_bureaucrat_t2f') },loc('governor_bureaucrat_t3')],
    }
};

const gov_traits = {
    tactician: {
        name: loc('gov_trait_tactician')
    },
    militant: {
        name: loc('gov_trait_militant')
    },
    noquestions: {
        name: loc('gov_trait_noquestions')
    },
    racketeer: {
        name: loc('gov_trait_racketeer')
    },
    dealmaker: {
        name: loc('gov_trait_dealmaker')
    },
    teacher: {
        name: loc('gov_trait_teacher')
    },
    risktaker: {
        name: loc('gov_trait_risktaker')
    },
    extravagant: {
        name: loc('gov_trait_extravagant')
    },
    respected: {
        name: loc('gov_trait_respected')
    },
    gaslighter: {
        name: loc('gov_trait_gaslighter')
    }
};

const names = {
    humanoid: ['Sanders','Smith','Geddon','Burgundy','Cristo','Crunch','Berg','Morros','Bower','Maximus'],
    animal: ['Instinct','Grazer','Paws','Fluffy','Snarl','Claws','Fang','Stalker','Pounce','Sniff'],
    small: ['Bahgins','Banks','Shorty','Parte','Underfoot','Shrimp','Finkle','Littlefoot','Cub','Runt'],
    giant: ['Slender','Titan','Colossus','Bean','Tower','Cloud','Bigfoot','Mountain','Crusher','Megaton'],
    reptilian: ['Scale','Chimera','Ecto','Bask','Forks','Croc','Slither','Sunny','Coldfoot','Webtoe'],
    avian: ['Sparrow','Soar','Shiney','Raven','Squaks','Eddy','Breeze','Flap','Kettle','Flock'],
    insectoid: ['Compound','Centi','Hiver','Buzz','Carpace','Swarm','Devour','Carpi','Chitter','Burrow'],
    plant: ['Grover','Blossom','Leaf','Sapper','Stem','Seed','Sprout','Greensly','Root','Fruit'],
    fungi: ['Detritus','Psychedelic','Cap','Rotface','Patch','Spore','Infecto','Filament','Symbiote','Shade'],
    aquatic: ['Seawolf','Finsley','Inko','Sucker','McBoatFace','Wave','Riptide','Shell','Coral','Pearl'],
    fey: ['Whisper','Prank','Mischief','Flutter','Nature','Dirt','Story','Booker','Tales','Spirit'],
    heat: ['Ash','Magnus','Pumice','Vulcano','Sweat','Flame','Lava','Ember','Smoke','Tinder','Spark'],
    polar: ['Frosty','Snowball','Flake','Chiller','Frost','Cooler','Icecube','Arctic','Tundra','Avalanche'],
    sand: ['Dune','Oasis','Sarlac','Spice','Quick','Grain','Spike','Storm','Glass','Castle'],
    demonic: ['Yekun','Kesabel','Gadreel','Penemue','Abaddon','Azazyel','Leviathan','Samyaza','Kasyade','Typhon'],
    angelic: ['Lightbringer','Illuminous','Sparks','Chrub','Halo','Star','Pompous','Radiant','Fluffy','Fabio']
};

export function genGovernor(setSize){
    let governors = [];
    let genus = races[global.race.species].type;
    let backgrounds = Object.keys(gmen);
    let nameList = JSON.parse(JSON.stringify(names[genus]));

    setSize = setSize || backgrounds.length;
    for (let i=0; i<setSize; i++){
        if (nameList.length === 0){
            nameList = JSON.parse(JSON.stringify(names[genus]));
        }
        if (backgrounds.length === 0){
            backgrounds = Object.keys(gmen);
        }

        let bgIdx = Math.floor(Math.seededRandom(0,backgrounds.length));
        let nameIdx = Math.floor(Math.seededRandom(0,nameList.length));

        let bg = backgrounds.splice(bgIdx,1)[0];
        let name = nameList.splice(nameIdx,1)[0];

        let title = gmen[bg].title[Math.floor(Math.seededRandom(0,gmen[bg].title.length))];
        if (typeof title === 'object'){
            title = Math.floor(Math.seededRandom(0,2)) === 0 ? title.m : title.f;
        }
        governors.push({ bg: bg, name: `${title} ${name}` });
    }
    
    return governors;
}