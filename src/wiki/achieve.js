import { global } from './../vars.js';
import { loc } from './../locale.js';
import { clearElement, svgIcons, svgViewBox, format_emblem, getBaseIcon, sLevel } from './../functions.js';
import { achievements, feats } from './../achieve.js';
import { races, biomes, genus_traits } from './../races.js';
import { popover } from './../functions.js';

export function renderAchievePage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'list':
            achievePage(content);
            break;
        case 'feats':
            featPage(content);
            break;
    }
}

function achievePage(){
    let content = $(`#content`);
    clearElement(content);

    let types = {};
    Object.keys(achievements).forEach(function (achievement){
        if (types.hasOwnProperty(achievements[achievement].type)){
            types[achievements[achievement].type].push(achievement);
        }
        else {
            types[achievements[achievement].type] = [achievement];
        }
    });

    Object.keys(types).forEach(function (type){
        content.append($(`<h2 class="header achievements has-text-caution">${loc(`wiki_achieve_${type}`)}</h2>`));
        let list = $(`<div class="achieveList"></div>`);
        content.append(list);

        types[type].forEach(function(achievement){
            let achieve = $(`<div class="achievement"></div>`);
            list.append(achieve);

            let color = global.stats.achieve[achievement] && global.stats.achieve[achievement].l > 0 ? 'warning' : 'fade';
            achieve.append(`<span id="a-${achievement}" class="achieve has-text-${color}">${achievements[achievement].name}</span>`);

            let emblems = format_emblem(achievement,16);
            achieve.append(`<span class="icons">${emblems}</span>`);
            
            achieveDesc(achievement);
        });
    });
}

function featPage(){
    let content = $(`#content`);
    clearElement(content);

    let list = $(`<div class="achieveList"></div>`);
    content.append(list);

    Object.keys(feats).forEach(function (feat){
        let achieve = $(`<div class="achievement"></div>`);
        list.append(achieve);

        let color = global.stats.feat[feat] && global.stats.feat[feat] > 0 ? 'warning' : 'fade';
        let baseIcon = getBaseIcon(feat,'feat');
        let star = global.stats.feat[feat] > 1 ? `<p class="flair" title="${sLevel(global.stats.feat[feat])} ${loc(baseIcon)}"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
        achieve.append(`<span id="f-${feat}" class="achieve has-text-${color}">${feats[feat].name}</span>${star}`);
        
        popover(`f-${feat}`,featDesc(feat));
    });
}

function achieveDesc(achievement){
    if (achievement === 'mass_extinction'){
        let killed = `<div class="flexed">`;
        Object.keys(races).sort(function(a,b){
            if (races[a].hasOwnProperty('name') && races[b].hasOwnProperty('name')){
                return races[a].name.localeCompare(races[b].name);
            }
            else {
                return 0;
            }            
        }).forEach(function (key){
            if (key !== 'protoplasm' && (key !== 'custom' || (key === 'custom' && global.stats.achieve['ascended']))){
                if (global.stats.achieve[`extinct_${key}`] && global.stats.achieve[`extinct_${key}`].l >= 0){
                    killed = killed + `<span class="has-text-success">${races[key].name}</span>`;
                }
                else {
                    killed = killed + `<span class="has-text-danger">${races[key].name}</span>`;
                }
            }
        });
        killed = killed + `<div>`;
        popover(`a-${achievement}`,$(`<div>${achievements[achievement].desc}</div>${killed}`));
    }
    else if (achievement === 'explorer'){
        let biome_list = `<div class="flexed">`;
        Object.keys(biomes).sort((a,b) => biomes[a].label.localeCompare(biomes[b].label)).forEach(function (key){
            if (global.stats.achieve[`biome_${key}`] && global.stats.achieve[`biome_${key}`].l >= 0){
                biome_list = biome_list + `<span class="has-text-success">${biomes[key].label}</span>`;
            }
            else {
                biome_list = biome_list + `<span class="has-text-danger">${biomes[key].label}</span>`;
            }
        });
        biome_list = biome_list + `<div>`;
        popover(`a-${achievement}`,$(`<div>${achievements[achievement].desc}</div>${biome_list}`));
    }
    else if (achievement === 'creator' || achievement === 'heavyweight'){
        let genus = `<div class="flexed">`;    
        Object.keys(genus_traits).sort().forEach(function (key){
            if (achievement === 'creator' ? global.stats.achieve[`genus_${key}`] && global.stats.achieve[`genus_${key}`].l >= 0 : global.stats.achieve[`genus_${key}`] && global.stats.achieve[`genus_${key}`].h >= 0){
                genus = genus + `<span class="wide has-text-success">${loc(`genelab_genus_${key}`)}</span>`;
            }
            else {
                if (key !== 'angelic' && achievement !== 'heavyweight') {
                    genus = genus + `<span class="wide has-text-danger">${loc(`genelab_genus_${key}`)}</span>`;
                }
            }
        });
        genus = genus + `<div>`;
        popover(`a-${achievement}`,$(`<div>${achievements[achievement].desc}</div>${genus}`));
    }
    else {
        popover(`a-${achievement}`,$(`<div>${achievements[achievement].desc}</div>`));
    }
}

function featDesc(feat){
    if (feat === 'egghunt'){
        let eggs = `<div class="has-text-warning">${loc('wiki_feat_egghunt')}</div><div class="flexed">`;
        for (let i=1; i<13; i++){
            let egg = global.special.egg[`egg${i}`] ? 'has-text-success' : 'has-text-danger';
            eggs = eggs + `<span class="${egg}">${loc('wiki_feat_egghunt_num',[i])}</span>`
        }
        eggs = eggs + `<div>`;
        return $(`<div>${feats[feat].desc}</div>${eggs}`);
    }
    else {
        return $(`<div>${feats[feat].desc}</div>`);
    }
}