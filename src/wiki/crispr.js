import { global } from './../vars.js';
import { loc } from './../locale.js';
import { genePool } from './../arpa.js';

export function crisprPage(content){
    content.append(`<div class="header has-text-warning">${loc('wiki_arpa_crispr')}</div>`);

    Object.keys(genePool).forEach(function (gene){
        let id = genePool[gene].id.split('-');
        let info = $(`<div id="${id[1]}" class="infoBox"></div>`);
        content.append(info);
        geneDesc(info,gene);
    });
}

function geneDesc(info,gene){
    info.append(`<div class="type"><h2 class="has-text-warning">${genePool[gene].title}</h2><span class="has-text-caution">${loc(`wiki_arpa_crispr_${genePool[gene].grant[0]}`)}: ${genePool[gene].grant[1]}</span></div>`);

    let stats = $(`<div class="stats"></div>`);
    info.append(stats);

    stats.append(`<div class="effect">${genePool[gene].desc}</div>`);
    stats.append(`<div class="cost right"><div class="has-text-warning">${loc('wiki_arpa_crispr_plasmid',[genePool[gene].cost])}</div></div>`);

    if (Object.keys(genePool[gene].reqs).length > 0){
        let reqs = $(`<div class="reqs"><span class="has-text-caution">${loc('wiki_arpa_crispr_req')}</span></div>`);
        info.append(reqs);

        let comma = false;
        Object.keys(genePool[gene].reqs).forEach(function (req){
            let color = global.genes[req] && global.genes[req] >= genePool[gene].reqs[req] ? 'success' : 'danger';
            reqs.append(`${comma ? `, ` : ``}<span class="has-text-${color}">${loc(`wiki_arpa_crispr_${req}`)} ${genePool[gene].reqs[req]}</span>`);
            comma = true;
        });
    }
}