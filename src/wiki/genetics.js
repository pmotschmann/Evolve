import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';
import { traits, traitSkin, genes, geneCatalog } from './../races.js';

// The rank costs are a table rather than a formula past a point, so the page prints the table
// itself rather than describing it. Read straight from races.js so a retune shows up here.
function rankCostList(){
    return genes.gene_rank_cost.map(function(c,i){
        return loc('wiki_genetics_rank_step',[i + 2,c]);
    }).join(', ');
}

function genusGeneList(){
    return geneCatalog().filter(function(g){ return traits[g].genus; }).length;
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

    infoBoxBuilder(mainContent,{ name: 'slots', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            1: [genes.gene_slot_count],
            2: [loc('resource_Genes_name')]
        }
    });
    sideMenu('add',`genetics-gameplay`,`slots`,loc('wiki_genetics_slots'));

    infoBoxBuilder(mainContent,{ name: 'cost', template: 'genetics', paragraphs: 3, break: [3], h_level: 2,
        para_data: {
            1: [genes.gene_slot_cost,loc('resource_Genes_name')],
            2: [genes.gene_first_cost],
            3: [genes.gene_rank_base,rankCostList()]
        },
        data_color: {
            3: ['warning','plain']
        }
    });
    sideMenu('add',`genetics-gameplay`,`cost`,loc('wiki_genetics_cost'));

    infoBoxBuilder(mainContent,{ name: 'break', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            1: [genes.gene_rank_base,genes.gene_break_ranks],
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

    infoBoxBuilder(mainContent,{ name: 'suited', template: 'genetics', paragraphs: 3, h_level: 2,
        para_data: {
            2: [traitSkin('name','arborist'),traitSkin('name','sapper')],
            3: [genusGeneList()]
        }
    });
    sideMenu('add',`genetics-gameplay`,`suited`,loc('wiki_genetics_suited'));
}
