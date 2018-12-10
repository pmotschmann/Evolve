const races = {
    protoplasm: {
        name: 'Protoplasm',
        desc: "Your race has yet to evolve into a complex lifeform, currently you're nothing but protoplasm in the primortal ooze.",
        type: 'organism'
    },
    human: {
        name: 'Human',
        desc: "Humans are versatile creatures who are adept at bending the enviroment around them to suit their needs. They are a ambitious race who seek to expand their knowledge of the universe around them and build great empires.",
        type: 'humanoid'
    },
    elven: {
        name: 'Elf',
        desc: 'Elves are typically tall and slender creatures with pointy ears, they tend to be reclusive but sharp of wit. Elves live long lives and often devote themsevles to study seeking answers to the deep fundamental questsion of the universe.',
        type: 'humanoid'
    },
    orc: {
        name: 'Orc',
        desc: "Orcs tend to be large and muscular creatures who are slow of wit but contain immense brute stength. They typically try to solve problems with violance first, then seek a more rational solution only when that doesn't work.",
        type: 'humanoid'
    },
    cath: {
        name: 'Cath',
        desc: 'The cath are a feline race who are typically lazy. They are stealthy and adapt at hunting when motivated, however most cath prefer to laze about rather then work hard.',
        type: 'animal'
    },
    wolven: {
        name: 'Wolven',
        desc: 'The wolven are a canine race who usally move in organized packs. They are a highly social species and rarely undertake any task alone.',
        type: 'animal'
    },
    centaur: {
        name: 'Centaur',
        desc: 'Centaur are a species of horse creatures who have human like upper bodies. They are fast moving and strong.',
        type: 'animal'
    },
    kobold: {
        name: 'Kobold',
        desc: 'Kobolds are small humanoid creatures who are known for their infatuation with candles. They are adapt at making the most of the natural resources of their enviroment.',
        type: 'small'
    },
    goblin: {
        name: 'Goblin',
        desc: 'Goblins are small humanoid creatures who are known for their greed and cunning. They are highly intellegent but typically selfish in nature.',
        type: 'small'
    },
    gnome: {
        name: 'Gnome',
        desc: 'Gnomes are small humanoid creatures who are known for their superior intelligence. They are natural scientists and seek to expand their knowledge, often at the cost of safetly and morality.',
        type: 'small'
    },
    orge: {
        name: 'Ogre',
        desc: 'Ogres are large humanoid creatures who are known for being kind of dumb. They are very strong with few other races being able to match their physical prowess, however they learn slowly.',
        type: 'giant'
    },
    cyclops: {
        name: 'Cyclops',
        desc: 'Cyclops are large humanoid creatures who have a single giant eye. They have poor depth perception but are fairly social and intelligent.',
        type: 'giant'
    },
    troll: {
        name: 'Troll',
        desc: 'Trolls are large humanoid creatures who are knwon for their regenerative powers. They are a hardy race highly resistent to disease and injury.',
        type: 'giant'
    },
    tortollan: {
        name: 'Tortollan',
        desc: 'Tortollans are a reptillan species with shells on their backs, they are slow moving and good at hiding.',
        type: 'reptillian'
    },
    gecko: {
        name: 'Gecko',
        desc: 'The gecks are a lizard species who can natually camouflage themselves to their surroundings. They are very agile and fast moving.',
        type: 'reptillian'
    },
    sethrak: {
        name: 'Sethrak',
        desc: 'Sethrak are a species who evolved from snakes. They have evoled to become bipedal creatures but otherwise maintain a strong resemblance to their snake ancestors.',
        type: 'reptillian'
    },
    arrakoa: {
        name: 'Arrakoa',
        desc: 'Arrakoa are a feathered species of flghtless birds. Long ago they may have taken to the skies but modern Arrakoa are too heavy to fly.',
        type: 'avian'
    },
    pterodacti: {
        name: 'Pterodacti',
        desc: 'Pterodacti are decended from large featherless flying creatures. Their skin is leathery and they have long, narrow heads.',
        type: 'avian'
    },
    dracnid: {
        name: 'Dracnid',
        desc: 'Dracnid are decended from large scaly flying creatures. They are tough being naturally armored, however they tend to be anti-social and greedy.',
        type: 'avian'
    },
    entish: {
        name: 'Ent',
        desc: 'Ents are basically sentient trees who can uproot themselvs and move around. They are large and slow moving, but fearsome and can get most of their nutrients from the sun.',
        type: 'plant'
    },
    cacti: {
        name: 'Cacti',
        desc: 'Cacti are small sentient plant creatures convered in spines. They are suprisingly fast moving, but easily startled.',
        type: 'plant'
    },
    sporgar: {
        name: 'Sporgar',
        desc: 'Sporgar are bizarre species that eolved from mold. They like to settle in damp humid places.',
        type: 'fungi'
    },
    shroomi: {
        name: 'Shroomi',
        desc: 'The Shroomi are a race of mushroom like creatures. They like dark places away from sunlight.',
        type: 'fungi'
    },
    mantis: {
        name: 'Mantis',
        desc: 'Mantis are an insectoid species that resemble giant... mantis. They are quick but fragile.',
        type: 'insectoid'
    },
    scorpid: {
        name: 'Scorpid',
        desc: 'Scorpid are a bipedal species with large claw hands and barbed tails. They are tough figters naturally equiped for close combat.',
        type: 'insectoid'
    },
    antid: {
        name: 'Antid',
        desc: 'Antid are a hivemind species decended from ants. Individually they are not intelligent but as their swarm gets bigger so does their collective intellegnce.',
        type: 'insectoid'
    }
};

const genus_traits = {
    humanoid: {
        // Base experience
    },
    animal: {
        
    },
    small: {
        // Small Habitats
        small: 1
    },
    giant: {
        // Increased Consumption
        large: 1
    },
    reptillian: {
        
    },
    avian: {
        
    },
    insectoid: {
        
    },
    plant: {
        // Photosynth
    },
    fungi: {
        
    }
};
