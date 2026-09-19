import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';
import { traits, traitSkin, genes, geneCatalog, geneEmergent, geneEmergentList } from './../races.js';

// The ladder printed on the page is generated from the same rule the game prices with, up to the
// paired ceiling, so a retune of either constant shows up here without touching this file.
function rankCostList(){
    let out = [];
    let cost = genes.gene_slot_cost;
    for (let r=2; r<=genes.gene_rank_paired; r++){
        cost = Math.round(cost * genes.gene_rank_growth);
        out.push(loc('wiki_genetics_rank_step',[r,cost]));
    }
    return out.join(', ');
}

// "A-T produces Content, C-G produces Promiscuous", built from the table itself so the page cannot
// disagree with the game about which rung grows what.
function emergentList(){
    return Object.keys(genes.gene_pairs).filter(function(b){
        return b < genes.gene_pairs[b];
    }).map(function(b){
        return loc('wiki_genetics_emergent_pair',[b,genes.gene_pairs[b],traitSkin('name',geneEmergent[b])]);
    }).join(', ');
}

function genusGeneList(){
    return geneCatalog().filter(function(g){ return traits[g].genus; }).length;
}

// A-T and C-G, in both directions: the four sequences a pair can read.
function pairSequences(){
    return Object.keys(genes.gene_pairs).map(function(b){
        return `[${b}]-[${genes.gene_pairs[b]}]`;
    }).join(', ');
}

function basePairList(){
    return Object.keys(genes.gene_pairs).filter(function(b){
        return b < genes.gene_pairs[b];
    }).map(function(b){ return `${b}-${genes.gene_pairs[b]}`; }).join(' and ');
}

// Map display categories to the trait-base table.
function taxonomyBases(){
    return ['combat','production','resource','utility'].map(function(t){ return genes.gene_taxonomy[t]; });
}

export function geneticsPage(content){
    let mainContent = sideMenu('create',content);

    infoBoxBuilder(mainContent,{ name: 'intro', template: 'genetics', label: loc('wiki_menu_genetics'), paragraphs: 3, h_level: 2,
        para_data: {
            2: [loc('resource_Phage_name'),loc('resource_Genes_name')],
            3: [geneCatalog().length]
        }
    });
    sideMenu('add',`genetics-gameplay`,`intro`,loc('wiki_menu_genetics'));

    infoBoxBuilder(mainContent,{ name: 'unlock', template: 'genetics', paragraphs: 3, break: [3], h_level: 2,
        para_data: {
            1: [genes.gene_unlock_phage,loc('resource_Phage_name')],
            2: [loc('resource_Phage_name')]
        }
    });
    sideMenu('add',`genetics-gameplay`,`unlock`,loc('wiki_genetics_unlock'));

    infoBoxBuilder(mainContent,{ name: 'slots', template: 'genetics', paragraphs: 4, h_level: 2,
        para_data: {
            1: [genes.strand_major_pairs,genes.strand_major_pairs * genes.strand_slots,
                genes.strand_minor_pairs,genes.strand_minor_pairs * genes.strand_slots],
            2: [loc('resource_Genes_name')],
            4: [traitSkin('name','versatility'),genes.versatility_pair_rank]
        }
    });
    sideMenu('add',`genetics-gameplay`,`slots`,loc('wiki_genetics_slots'));

    infoBoxBuilder(mainContent,{ name: 'strand', template: 'genetics', paragraphs: 4, break: [4], h_level: 2,
        para_data: {
            2: [pairSequences(),basePairList()],
            4: taxonomyBases()
        }
    });
    sideMenu('add',`genetics-gameplay`,`strand`,loc('wiki_genetics_strand'));

    infoBoxBuilder(mainContent,{ name: 'major', template: 'genetics', paragraphs: 4, break: [4], h_level: 2,
        para_data: {
            1: [loc('resource_Genes_name')],
            3: [genes.minor_slot_penalty * 100,genes.gene_rank_major,genes.gene_rank_paired]
        }
    });
    sideMenu('add',`genetics-gameplay`,`major`,loc('wiki_genetics_major'));

    infoBoxBuilder(mainContent,{ name: 'emergent', template: 'genetics', paragraphs: 4, break: [3], h_level: 2,
        para_data: {
            1: [geneEmergentList().map(function(g){ return traitSkin('name',g); }).join(' and ')],
            2: [emergentList()]
        }
    });
    sideMenu('add',`genetics-gameplay`,`emergent`,loc('wiki_genetics_emergent'));

    infoBoxBuilder(mainContent,{ name: 'held', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            2: [genes.genus_emergent_floor]
        }
    });
    sideMenu('add',`genetics-gameplay`,`held`,loc('wiki_genetics_held'));

    infoBoxBuilder(mainContent,{ name: 'granted', template: 'genetics', paragraphs: 2, h_level: 2 });
    sideMenu('add',`genetics-gameplay`,`granted`,loc('wiki_genetics_granted'));

    infoBoxBuilder(mainContent,{ name: 'cost', template: 'genetics', paragraphs: 3, break: [3], h_level: 2,
        para_data: {
            1: [genes.gene_slot_cost,loc('resource_Genes_name')],
            3: [genes.gene_rank_major,genes.gene_rank_paired,rankCostList()]
        },
        data_color: {
            3: ['warning','warning','plain']
        }
    });
    sideMenu('add',`genetics-gameplay`,`cost`,loc('wiki_genetics_cost'));

    infoBoxBuilder(mainContent,{ name: 'break', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            1: [genes.gene_break_ranks],
            2: genes.gene_break_cost.concat([genes.gene_break_step])
        }
    });
    sideMenu('add',`genetics-gameplay`,`break`,loc('wiki_genetics_break'));

    infoBoxBuilder(mainContent,{ name: 'special', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            1: [traitSkin('name','fortify'),traitSkin('name','mastery')],
            2: [traitSkin('name','fortify')],
            3: [traitSkin('name','mastery'),loc('arpa_genepool_mastered_title'),loc('resource_Genes_name')]
        }
    });
    sideMenu('add',`genetics-gameplay`,`special`,loc('wiki_genetics_special'));

    infoBoxBuilder(mainContent,{ name: 'suited', template: 'genetics', paragraphs: 4, h_level: 2,
        para_data: {
            2: [traitSkin('name','arborist'),traitSkin('name','sapper')],
            3: [genusGeneList()]
        }
    });
    sideMenu('add',`genetics-gameplay`,`suited`,loc('wiki_genetics_suited'));
}
