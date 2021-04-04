import { global } from './../vars.js';
import { clearElement, eventActive } from './../functions.js';
import { loc } from './../locale.js';
import { sideMenu, infoBoxBuilder } from './functions.js';

export function eventsPage(zone){
    let content = $(`#content`);
    clearElement(content);

    switch (zone){
        case 'major':
            mainEventsPage(content);
            break;
        case 'special':
            specialEventsPage(content);
            break;     
    }
}

function mainEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // DNA Replication
        let section = infoBoxBuilder(mainContent,{ name: 'replication', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_replication_para1_note',[3])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_replication'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`replication`,loc('wiki_events_replication'));
    }

    {   // RNA Meteor
        let section = infoBoxBuilder(mainContent,{ name: 'rna_meteor', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,loc('wiki_events_rna_meteor_para1_note',[2])],
            }
        });
        infoBoxBuilder(mainContent, { name: 'evolution', template: 'events', label: loc('wiki_events_rna_meteor'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`rna_meteor`,loc('wiki_events_rna_meteor'));
    }

    {   // Inspiration
        infoBoxBuilder(mainContent,{ name: 'inspiration', template: 'events', label: loc('wiki_events_inspiration'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [300,600],
            }
        });
        sideMenu('add',`major-events`,`inspiration`,loc('wiki_events_inspiration'));
    }

    {   // Fire
        let section = infoBoxBuilder(mainContent,{ name: 'fire', template: 'events', label: loc('wiki_events_fire'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [1,`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'fire_condition', template: 'events', label: loc('wiki_events_fire'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`fire`,loc('wiki_events_fire'));
    }

    {   // Flare
        let section = infoBoxBuilder(mainContent,{ name: 'flare', template: 'events', label: loc('wiki_events_flare'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`10%`],
                3: [`20%`,20,200],
            }
        });
        infoBoxBuilder(mainContent, { name: 'flare_condition', template: 'events', label: loc('wiki_events_flare'), paragraphs: 4, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`flare`,loc('wiki_events_flare'));
    }

    {   // Raid
        let section = infoBoxBuilder(mainContent,{ name: 'raid', template: 'events', label: loc('wiki_events_raid'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`25%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'raid_condition', template: 'events', label: loc('wiki_events_raid'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`raid`,loc('wiki_events_raid'));
    }

    {   // Siege
        let section = infoBoxBuilder(mainContent,{ name: 'siege', template: 'events', label: loc('wiki_events_siege'), paragraphs: 3, h_level: 2,
            para_data: {
                2: [`50%`],
            }
        });
        infoBoxBuilder(mainContent, { name: 'siege_condition', template: 'events', label: loc('wiki_events_siege'), paragraphs: 2, h_level: 2 }, section);
        sideMenu('add',`major-events`,`siege`,loc('wiki_events_siege'));
    }

    {   // Terrorist
        let section = infoBoxBuilder(mainContent,{ name: 'terrorist', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'terrorist_condition', template: 'events', label: loc('wiki_events_terrorist'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`terrorist`,loc('wiki_events_terrorist'));
    }

    {   // Quake
        let section = infoBoxBuilder(mainContent,{ name: 'quake', template: 'events', label: loc('wiki_events_quake'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'quake_condition', template: 'events', label: loc('wiki_events_quake'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`quake`,loc('wiki_events_quake'));
    }

    {   // Doom
        let section = infoBoxBuilder(mainContent,{ name: 'doom', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'doom_condition', template: 'events', label: loc('wiki_events_doom'), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`major-events`,`doom`,loc('wiki_events_doom'));
    }

    {   // Demon Horde
        let section = infoBoxBuilder(mainContent,{ name: 'dhorde', template: 'events', label: loc('wiki_events_dhorde'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [2500,5000],
            }
        });
        infoBoxBuilder(mainContent, { name: 'dhorde_condition', template: 'events', label: loc('wiki_events_dhorde'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`dhorde`,loc('wiki_events_dhorde'));
    }

    {   // Ancient Ruins
        let section = infoBoxBuilder(mainContent,{ name: 'ruins', template: 'events', label: loc('wiki_events_ruins'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc(`resource_Iron_name`),loc(`resource_Copper_name`),loc(`resource_Steel_name`),loc(`resource_Cement_name`),'25%'],
            }
        });
        infoBoxBuilder(mainContent, { name: 'ruins_condition', template: 'events', label: loc('wiki_events_ruins'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`ruins`,loc('wiki_events_ruins'));
    }

    {   // Tax Revolt
        let section = infoBoxBuilder(mainContent,{ name: 'taxrevolt', template: 'events', label: loc('wiki_events_taxrevolt'), paragraphs: 2, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'taxrevolt_condition', template: 'events', label: loc('wiki_events_taxrevolt'), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                1: [`> 25%`,`< 100%`],
                2: [loc('govern_oligarchy'),`> 45%`]
            }
        }, section);
        sideMenu('add',`major-events`,`taxrevolt`,loc('wiki_events_taxrevolt'));
    }

    {   // Slave Death
        let section = infoBoxBuilder(mainContent,{ name: 'slave', template: 'events', label: loc('wiki_events_slave'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'slave_condition', template: 'events', label: loc('wiki_events_slave'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`trait_slaver_name`)]
            }
        }, section);
        sideMenu('add',`major-events`,`slave`,loc('wiki_events_slave'));
    }

    {   // Protests
        let section = infoBoxBuilder(mainContent,{ name: 'protest', template: 'events', label: loc('wiki_events_protest'), paragraphs: 3, h_level: 2,
            para_data: {
                1: [loc('govern_republic')],
                2: ['30%'],
                3: [30,90],
            }
        });
        infoBoxBuilder(mainContent, { name: 'protest_condition', template: 'events', label: loc('wiki_events_protest'), paragraphs: 1, h_level: 2,
            para_data: {
                1: [loc(`govern_republic`)]
            }
        }, section);
        sideMenu('add',`major-events`,`protest`,loc('wiki_events_protest'));
    }

    {   // Spy Caught
        let section = infoBoxBuilder(mainContent,{ name: 'spy', template: 'events', label: loc('wiki_events_spy'), paragraphs: 1, h_level: 2 });
        infoBoxBuilder(mainContent, { name: 'spy_condition', template: 'events', label: loc('wiki_events_spy'), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`major-events`,`spy`,loc('wiki_events_spy'));
    }
}

function specialEventsPage(content){
    let mainContent = sideMenu('create',content);
    
    {   // Friday the 13th
        let event = 'crystal';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_friday_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Valentine's Day
        let event = 'valentine';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_love_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Unlucky
        let event = 'unlucky';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_leprechaun_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // April Fools Day
        let event = 'fool';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_fool_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {
        let easter = eventActive('easter');
        {   // Hopper
            let event = 'hopper';
            let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    2: [loc('feat_easter_name')],
                }
            });
            infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [`${loc(`month${easter.date[0]}`)} ${easter.date[1]}`],
                }
            }, section);
            sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
        }

        {   // Egg Hunt
            let event = 'egghunt';
            let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 5, break: [2,3,4], h_level: 2,
                para_data: {
                    2: [loc('feat_egghunt_name'),12,15],
                    5: [loc('trait_hyper_name'),loc('trait_fast_growth_name'),loc('trait_rainbow_name'),loc('trait_optimistic_name')],
                }
            });

            let hints = [
                `U2FsdGVkX1/PcdpekGFnkjSSCBa9yVo3z5xq3a2662iSlAA8yuaPEsK4Qyn5OSED`,
                `U2FsdGVkX180d8+Fl8mi96tY7KHkOWLkO0syi+BeZW47ga9AdJiBdbsksLaMTGvT`,
                `U2FsdGVkX19hHAatSiZiYe33Hx4u+bixNx4U7O4smhKVb/a+umB6MlIbgM3eE3UG`,
                `U2FsdGVkX188sIGEBwWHyzf0SkKQ027dzHZmkJp93FeXrXu70hD0KqYfoTxnbGqU`,
                `U2FsdGVkX18dLIKZyFStCpVKJrFAc36LF4uNcpuJd8CGU0yC1rPllsNfBHAhrfwT`,
                `U2FsdGVkX1/ZRiMKl3kG4PUQOx8bdgz7va6bLW3Gf5COBHAs7CMDITt7SDeIygvd`,
                `U2FsdGVkX19FZ4kZmquyj6NUTqo+AYS7U31mSik1W2Awdp5M6L1WlsG4Px8uUYUN`,
                `U2FsdGVkX1+9Eh/34O02cW0SuZg0rQYZnomSBjBQU4Q3VSU0y62ypmoJNjOb5Uix`,
                `U2FsdGVkX1+3qtRH9MVd1B8T+JP5DgnlER6u8P60vX/NVjLGuceG7DX+b2yPW3J5`,
                `U2FsdGVkX18JYj4R4QuZBpDdcsEjkYPAf3uNNIzu6Vs=`,
                `U2FsdGVkX1+Eq43UVbtPlveU6HqIU8PSHL8QH+FlUxWkhyB1S+QAVVM2z0OryeJd`,
                `U2FsdGVkX18brcDy1P4HEGkmTw5t19CgWEshDFRSByELjSG9MtvSdSBbj13JhYuG`,
                `U2FsdGVkX1/vr39YAfqKcFM7c8ed6Oi7lRrDYKDtfUJRKF3pcrIRAWc4FF/Tt5BjwaXOi0slDE9JmeIDifD2gw==`,
                `U2FsdGVkX19KtuHoWRLTz0wLH8D/fLoOriDsmk6agzT85xsAAXv26ILjSV2C8mpi`,
                `U2FsdGVkX18/Tyjq6czHYJKjJQPXcRCgqmZqu2AFmx2FddfQPzM+YkXXECLMVA+e`
            ];

            let solutions = [
                `U2FsdGVkX1+duY7hvIoeOGqas8WhBy8hojTLQ0OxadHBEDzOPwpc4K1Y6N+WyDah`,
                `U2FsdGVkX1+AQhvu619WY9xow4HmruRn5yJefuIkv3u7U6baVdV/mHLJfUaNmTE6`,
                `U2FsdGVkX1/whjtke2hryY9zWuV0MTzN2JKXaFyzwJXwtEx9+iLMbHkdVFwi6h63`,
                `U2FsdGVkX18FBXNUeu4NIIiy4Mmk++iyUIJKxFS/mZvAj98+eJR+SZj8xpXHTkia`,
                `U2FsdGVkX1/Imw6q6mixFM1BlgToue0NUqbCTHKuNZFHC1Vp7I934fUpj/xCFg33`,
                `U2FsdGVkX18h03LNWLTF59y343iStuLaS/0cgvLtKSMzm8UpzMVWBxwkGGSxDDPO`,
                `U2FsdGVkX18+W3R7IyisKi9TgzbkQ/636SJ7ubGsCx6Rz5GMxlTkbTVbOG6YFAC4Cle0TjI1riEzpGQtuCr6C+1mX3FdCLVz3oaGWqIajvI=`,
                `U2FsdGVkX18CjBzSHSIPZ07ZgvI6JgGiVIJE4ugYa2xWFeM1a/OnXrMT1sBpwmXwiHayBp1tdw83/4I55pGwpA==`,
                `U2FsdGVkX1+QWybO+rnrqxI23qXSKzevq0C/NPkX8/kd5h0xo20ozmxo4Pknui3G`,
                `U2FsdGVkX1//2GoF+3kVNPim1ThpVMgMCHEzSH0UZCrc4EIjktoxBC87gXddwhZR`,
                `U2FsdGVkX1/HQFE7BGTMIHN8G4pljsZlwtFaXHZh2U/VN4DD8lOL4OUYxnJUGr+g`,
                `U2FsdGVkX1/f1jFsIVKmxsXq85PuOj+fq+9WtYf1AZbPsuChio/XV6mpCxlTJz8X`,
                `U2FsdGVkX1+NRsztgBjDQeevIAYiHJ+X9dUERkDoYpLcvYAvWWzVvbjk4uq4dSMPEuykMqsZGGwvBtl1V0T+pO254xK8+5xWjZYnE9x6A+I=`,
                `U2FsdGVkX1//Crqk3ZOt8MHG/C4V91VEORQ3rQe4CEBHQhqfMD84PrEBZkwN7VpKvBgcg+2FsDknW+LDnNPIZA==`,
                `U2FsdGVkX1/bUrGTAmEkt6ukJKG8tIAIUVr4fnMFPsdamUtLJBGIG2dwQyaYywTD`
            ];

            const date = new Date();
            const year = date.getFullYear();
            const passphrase = 'egghunt';
            let eggs = `<div class="has-text-warning">${loc('wiki_feat_egghunt_found')}</div>`;
            eggs = eggs + `<div class="tbl">`;
            for (let i=1; i<=15; i++){
                let egg = global.special.egg.hasOwnProperty(year) && global.special.egg[year][`egg${i}`] ? 'has-text-success' : 'has-text-danger';
                let found = global.special.egg.hasOwnProperty(year) && global.special.egg[year][`egg${i}`] ? 'found' : 'missing';
                
                let hint = `<span class="tcell">${loc('wiki_events_hint_avail')} ${loc(`month${easter.hintDate[0]}`)} ${easter.hintDate[1]}</span>`;
                if (easter.hint){
                    const bytes = CryptoJS.AES.decrypt(hints[i-1], passphrase);
                    hint = `<span class="tcell">` + bytes.toString(CryptoJS.enc.Utf8) + `</span>`;
                }

                let sol = `<span class="tcell">${loc('wiki_events_sol_avail')} ${loc(`month${easter.solveDate[0]}`)} ${easter.solveDate[1]}</span>`;
                if (easter.solve){
                    sol = `<span class="tcell eggsol" data-sol="${solutions[i-1]}">${loc('wiki_events_reveal_sol')}</span>`;
                }

                eggs = eggs + `<div class="trow"><span role="img" class="tcell ${egg}" aria-label="${loc('wiki_feat_egghunt_num',[i])} ${found}">${loc('wiki_feat_egghunt_num',[i])}</span>${hint}${sol}</div>`
            }
            eggs = eggs + `</div>`;
            section.append(eggs);

            $(`.eggsol`).on('click', function(){
                const solution = $(this).attr('data-sol');
                const bytes = CryptoJS.AES.decrypt(solution, passphrase);
                $(this).html(bytes.toString(CryptoJS.enc.Utf8));
            });

            infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
                para_data: {
                    1: [`${loc(`month${easter.date[0]}`)} ${easter.date[1]}`, `${loc(`month${easter.endDate[0]}`)} ${easter.endDate[1]}`],
                }
            }, section);
            sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
        }
    }

    {   // Halloween
        let event = 'halloween';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2,
            para_data: {
                2: [loc('feat_boo_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // Thanksgiving
        let event = 'turkey';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 3, break: [2,3], h_level: 2,
            para_data: {
                2: [loc('feat_gobble_gobble_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 2, break: [2], h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }

    {   // XMas
        let event = 'xmas';
        let section = infoBoxBuilder(mainContent,{ name: event, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 5, break: [2,3,4,5], h_level: 2,
            para_data: {
                2: [loc('feat_xmas_name')],
            }
        });
        infoBoxBuilder(mainContent, { name: `${event}_condition`, template: 'events', label: loc(`wiki_events_${event}`), paragraphs: 1, h_level: 2 }, section);
        sideMenu('add',`special-events`,event,loc(`wiki_events_${event}`));
    }
}