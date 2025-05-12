import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, popover, getEaster, getHalloween, getTraitDesc } from './../functions.js';
import { races, traits, genus_def, traitSkin } from './../races.js';
import { ascendLab } from './../space.js';
import { actions } from './../actions.js';
import { sideMenu } from './functions.js';
import { customRaceMechanics } from './mechanics.js';

const hallowed = getHalloween();

export function speciesPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'races':
            racesPage(content);
            break;
        case 'traits':
            traitsPage(content);
            break;
        case 'custom':
            customPage(content);
            break;
    }
}

export function customPage(content) {
    customRaceMechanics(content,true);
    let lab = $(`<div class="infoBox wide"></div>`);
    content.append(lab);
    ascendLab(false,lab);
}

const evolutionPath = {
    angelic: ['phagocytosis', 'mammals', 'celestial'],
    aquatic: ['phagocytosis', 'aquatic'],
    avian: ['phagocytosis', 'eggshell', 'endothermic'],
    carnivore: ['phagocytosis', 'mammals', 'animalism', 'carnivore'],
    demonic: ['phagocytosis', 'mammals', 'demonic'],
    eldritch: ['phagocytosis', 'eldritch'],
    fey: ['phagocytosis', 'fey'],
    fungi: ['chitin'],
    giant: ['phagocytosis', 'mammals', 'gigantism'],
    heat: ['phagocytosis', 'heat'],
    herbivore: ['phagocytosis', 'mammals', 'animalism', 'herbivore'],
    humanoid: ['phagocytosis', 'mammals', 'humanoid'],
    insectoid: ['phagocytosis', 'athropods'],
    plant: ['chloroplasts'],
    polar: ['phagocytosis', 'polar'],
    reptilian: ['phagocytosis', 'eggshell', 'ectothermic'],
    sand: ['phagocytosis', 'sand'],
    small: ['phagocytosis', 'mammals', 'dwarfism'],
    synthetic: ['exterminate'],
};

Object.keys(evolutionPath).forEach(function (key) {
    evolutionPath[key] = evolutionPath[key].map(function (s) { return typeof actions.evolution[s].title === 'function' ? actions.evolution[s].title() : actions.evolution[s].title; }).join(' -> ');
});

export function racesPage(content){
    content = sideMenu('create',content);

    let genus_trank_pri = (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4) ? 2 : 1;
    let genus_trank_sec = (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4) ? 1 : 0.5;
    let list = [];
    Object.keys(races).forEach(function (race){
        if ((race === 'custom' && !global.custom.hasOwnProperty('race0')) 
            || (race === 'hybrid' && !global.custom.hasOwnProperty('race1'))
            || race === 'protoplasm'){
            return;
        }

        let info = $(`<div id="${race}" class="infoBox"></div>`);
        content.append(info);

        let typeList = [];
        let genusListing = ``;
        if (races[race].type === 'hybrid'){
            typeList = races[race].hybrid;
        }
        else {
            typeList.push(races[race].type);
        }

        typeList.forEach(function (gType){
            genusListing += `<span id="genus${race}${gType}" class="has-text-caution">${loc(`genelab_genus_${gType}`)}</span>`;
        });

        info.append(`<div class="type"><h2 class="has-text-warning">${races[race].name}</h2><span>${genusListing}</span></div>`);
        info.append(`<div class="desc">${typeof races[race].desc === 'string' ? races[race].desc : races[race].desc()}</div>`);

        let traitList = [];
        let extraTraits = extraTraitList(race);

        let genes = $(`<div class="itemlist"></div>`);
        let firstType = true; // For hybrids, arbitrarily display one type as primary and the other as secondary

        (typeList.includes('carnivore') && typeList.includes('herbivore') ? ['omnivore'] : typeList).forEach(function (gType){
            if (race !== 'hellspawn'){
                Object.keys(genus_def[gType].traits).sort().forEach(function (trait){
                    let id = `raceTrait${race}${trait}`;
                    let color = races[race].fanaticism === trait ? 'danger' : 'caution';
                    genes.append(`<span class="has-text-${color}" id="${id}">${traitSkin('name', trait, race)}<span>`);
                    traitList.push({ t: trait, r: firstType ? genus_trank_pri : genus_trank_sec});
                });
            }
            firstType = false;
        });

        Object.keys(races[race].traits).sort().forEach(function (trait){
            if (hallowed.active && ((race === 'tortoisan' && trait === 'slow') || (race === 'unicorn' && trait === 'rainbow'))){
                return;
            }
            let id = `raceTrait${race}${trait}`;
            let color = races[race].fanaticism === trait ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traitSkin('name', trait, race)}<span>`);
            traitList.push({ t: trait, r: races[race].traits[trait] });
        });
        for (let i=0; i<extraTraits.length; i++){
            let id = `raceTrait${race}${extraTraits[i].t}`;
            let color = races[race].fanaticism === extraTraits[i] ? 'danger' : 'info';
            genes.append(`<span class="has-text-${color}" id="${id}">${traitSkin('name', extraTraits[i].t, race)}<span>`);
            traitList.push(extraTraits[i]);
        }
        info.append(genes);
        list.push(race);

        typeList.forEach(function (gType){
            popover(`genus${race}${gType}`,$(`<div>${loc(`genelab_genus_${gType}_desc`)}<br><br>${evolutionPath[gType]}</div>`),{ wide: true, classes: 'w25' });
        });

        for (let i=0; i<traitList.length; i++){
            let id = `raceTrait${race}${traitList[i].t}`;
            let desc = $(`<div></div>`);

            getTraitDesc(desc, traitList[i].t, {
                fanatic: traitList[i].t === races[race].fanaticism ? races[race].name : false, 
                trank: traitList[i].r,
                rpage: true,
                wiki: true,
                species: race
            });

            popover(id,desc,{ wide: true, classes: 'w25' });
        }
    });

    list.sort((a,b) => races[a].name < races[b].name ? -1 : 1).forEach(function(race){
        sideMenu('add',`races-species`,race,races[race].name);
    });
}

function extraTraitList(race){
    const date = new Date();
    const easter = getEaster();
    switch (race){
        case 'wolven':
            return easter.active ? [{t: 'hyper', r: 1},{t: 'fast_growth', r: 1},{t: 'rainbow', r: 1},{t: 'optimistic', r: 1}] : [];
        case 'vulpine':
            return easter.active ? [{t: 'cannibalize', r: 1},{t: 'rage', r: 1},{t: 'blood_thirst', r: 1},{t: 'sticky', r: 1}] : [];
        case 'elven':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'slaver', r: 2},{t: 'resourceful', r: 0.5},{t: 'small', r: 0.25}] : [];
        case 'capybara':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'beast_of_burden', r: 1},{t: 'pack_rat', r: 0.5},{t: 'musical', r: 0.25}] : [];
        case 'centaur':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'beast_of_burden', r: 1},{t: 'curious', r: 0.5},{t: 'blissful', r: 0.25}] : [];
        case 'wendigo':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'immoral', r: 3},{t: 'cannibalize', r: 0.5},{t: 'claws', r: 0.25}] : [];
        case 'yeti':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'scavenger', r: 3},{t: 'regenerative', r: 0.5},{t: 'musical', r: 0.25}] : [];
        case 'entish':
            return date.getMonth() === 11 && date.getDate() >= 17 ? [{t: 'photosynth', r: 3},{t: 'optimistic', r: 0.5},{t: 'armored', r: 0.25}] : [];
        case 'human':
            return hallowed.active ? [{t: 'anthropophagite', r: 1}, {t: 'cannibalize', r: 2}, {t: 'infectious', r: 3}] : [];
        case 'tortoisan':
            return hallowed.active ? [{t: 'hyper', r: 0.25}, {t: 'swift', r: 0.5}, {t: 'infiltrator', r: 1}] : [];
        case 'unicorn':
            return hallowed.active ? [{t: 'gloomy', r: 1}, {t: 'darkness', r: 1}] : [];
        default:
            return [];
    }
}

export function traitsPage(content){
    content = sideMenu('create',content);

    let types = [['genus','major'],['minor'],['special']];
    for (let i=0; i<types.length; i++){
        Object.keys(traits).sort( (a,b) => traitSkin('name',a).localeCompare(traitSkin('name',b)) ).forEach(function (trait){
            if (types[i].includes(traits[trait].type)){
                let info = $(`<div id="${traits[trait].type}_${trait}" class="infoBox"></div>`);
                content.append(info);
                getTraitDesc(info, trait, { tpage: true, wiki: true });
                sideMenu('add',`traits-species`,`${traits[trait].type}_${trait}`,traitSkin('name',trait));
            }
        });
    }
}
