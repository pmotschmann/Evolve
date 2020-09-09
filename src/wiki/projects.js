import { loc } from './../locale.js';
import { arpaProjects } from './../arpa.js';
import { sideMenu } from './functions.js';

const extraInformation = {
    launch_facility: [loc('wiki_arpa_project_launch_facility')],
    monument: [monumentExtra(),loc('wiki_arpa_project_monument_random'),loc('wiki_arpa_project_monument_exceptions')],
    roid_eject: [loc('wiki_arpa_project_roid_eject')]
};

export function projectsPage(content){
    content.append(`<div class="header has-text-warning">${loc('wiki_arpa_projects')}</div>`);

    let mainContent = $(`<div></div>`);
    let projectContent = sideMenu('create',mainContent);
    content.append(mainContent);

    Object.keys(arpaProjects).forEach(function (project){
        let info = $(`<div id="${project}" class="infoBox"></div>`);
        projectContent.append(info);
        projectDesc(info,project);
        sideMenu('add',`projects-arpa`,project,typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title(true));
    });
}

function projectDesc(info,project){
    let title = typeof arpaProjects[project].title === 'string' ? arpaProjects[project].title : arpaProjects[project].title(true);
    info.append(`<div class="type"><h2 class="has-text-warning">${title}</h2></div>`);

    let stats = $(`<div class="stats"></div>`);
    info.append(stats);

    stats.append(`<div class="effect">${typeof arpaProjects[project].desc === 'string' ? arpaProjects[project].desc : arpaProjects[project].desc()}</div>`);
    stats.append(`<div class="effect">${typeof arpaProjects[project].effect === 'string' ? arpaProjects[project].effect : arpaProjects[project].effect()}</div>`);

    if (extraInformation[project]){
        let extra = $(`<div></div>`);
        info.append(extra);
        addInformation(extra,project);
    }
}

function addInformation(parent,key){
    let extra = $(`<div class="extra"></div>`);
    parent.append(extra);
    if (extraInformation.hasOwnProperty(key)){
        for (let i=0; i<extraInformation[key].length; i++){
            extra.append(`<div>${extraInformation[key][i]}</div>`);
        }
    }
}

function monumentExtra(){
    let monuments = [
        loc('arpa_project_monument_obelisk'),
        loc('arpa_project_monument_statue'),
        loc('arpa_project_monument_sculpture'),
        loc('arpa_project_monument_monolith'),
        loc('arpa_project_monument_pillar'),
        loc('arpa_project_monument_megalith')
    ];
    let materials = [
        loc('resource_Stone_name'),
        loc('resource_Aluminium_name'),
        loc('resource_Steel_name'),
        loc('resource_Cement_name'),
        loc('resource_Bones_name'),
        loc('resource_Crystal_name'),
    ];
    let desc = `<div>${loc('wiki_arpa_project_monument',[monuments.length, monuments.join(", ")])}</div>`;
    for (let i=0; i<monuments.length; i++){
        desc = desc + `<div>${loc('wiki_arpa_project_monument_type',[
            `<span class="has-text-warning">${monuments[i]}</span>`,
            `<span class="has-text-warning">${materials[i]}</span>`
        ])}</div>`;
    }
    return desc;
}