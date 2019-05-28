import { global, vues, poppers, messageQueue } from './vars.js';
import { races } from './races.js';
import { spatialReasoning } from './resources.js';
import { payCosts, setAction } from './actions.js';

const spaceProjects = {
    spc_home: {
        info: {
            name(){
                return races[global.race.species].home;
            },
            desc: 'Your home planet',
        },
        test_launch: {
            id: 'space-test_launch',
            title: 'Test Launch',
            desc: 'Launch a test rocket',
            reqs: { space: 1 },
            grant: ['space',2],
            cost: {
                Money(){ return 100000; },
                Oil(){ return 7500; }
            },
            effect: 'Launch an experimental test rocket into space.',
            action(){
                if (payCosts(spaceProjects.spc_home.test_launch.cost)){
                    messageQueue('You have successfully launched your first rocket into space','success');
                    global.space['satellite'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        satellite: {
            id: 'space-satellite',
            title: 'Satellite',
            desc: 'Launch a scientific satellite',
            reqs: { space: 2 },
            cost: {
                Money(){ return costMultiplier('satellite', 75000, 1.35); },
                Knowledge(){ return costMultiplier('satellite', 50000, 1.35); },
                Oil(){ return costMultiplier('satellite', 5000, 1.35); },
                Alloy(){ return costMultiplier('satellite', 10000, 1.35); }
            },
            effect: '<div>+500 Max Knowledge</div><div>+4% Wardenclyffe Max Knowledge</div><div>+1% Scientist Efficiency</div>',
            action(){
                if (payCosts(spaceProjects.spc_home.satellite.cost)){
                    global.space['satellite'].count++;
                    global['resource']['Knowledge'].max += 500;
                    return true;
                }
                return false;
            }
        },
        gps: {
            id: 'space-gps',
            title: 'GPS Satellite',
            desc: '<div>Launch a GPS satellite</div><div class="has-text-special">Requires minimum 4 satellites</div>',
            reqs: { satellite: 1 },
            cost: {
                Money(){ return costMultiplier('gps', 75000, 1.3); },
                Knowledge(){ return costMultiplier('gps', 50000, 1.3); },
                Copper(){ return costMultiplier('gps', 6500, 1.3); },
                Oil(){ return costMultiplier('gps', 3500, 1.3); },
                Titanium(){ return costMultiplier('gps', 8000, 1.3); }
            },
            effect(){
                if (global.space['gps'].count < 4){
                    return `You need a minimum of 4 GPS satellites to establish a GPS signal. The first 3 effectively do nothing.`;
                }
                else {
                    'Does Nothing, no seriously this does nothing.'
                }
            },
            action(){
                if (payCosts(spaceProjects.spc_home.gps.cost)){
                    global.space['gps'].count++;
                    return true;
                }
                return false;
            }
        },
        propellant_depot: {
            id: 'space-propellant_depot',
            title: 'Propellant Depot',
            desc: 'Construct an orbital depot',
            reqs: { space_explore: 1 },
            cost: {
                Money(){ return costMultiplier('propellant_depot', 55000, 1.35); },
                Oil(){ return costMultiplier('propellant_depot', 5500, 1.35); },
                Steel(){ return costMultiplier('propellant_depot', 22000, 1.35); }
            },
            effect(){
                let oil = spatialReasoning(1250);
                if (global.resource['Helium_3'].display){
                    let helium = spatialReasoning(1000);
                    return `<div>+${oil} Max Oil</div><div>+${helium} Max Helium 3</div>`;
                }
                return `<div>+${oil} Max Oil.</div>`;
            },
            action(){
                if (payCosts(spaceProjects.spc_home.propellant_depot.cost)){
                    global.space['propellant_depot'].count++;
                    global['resource']['Oil'].max += spatialReasoning(1250);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(1000);
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_moon: {
        info: {
            name: 'Moon',
            desc(){
                let home = races[global.race.species].home;
                return `The moon orbiting ${home}`;
            },
            support: 'moon_base',
        },
        moon_mission: {
            id: 'space-moon_mission',
            title: 'Moon Launch',
            desc: 'Launch the Moon Mission',
            reqs: { space: 2, space_explore: 2 },
            grant: ['space',3],
            cost: { 
                Oil(){ return 12000; }
            },
            effect: 'Launch a mission to survey the moon.',
            action(){
                if (payCosts(spaceProjects.spc_moon.moon_mission.cost)){
                    return true;
                }
                return false;
            }
        },
        moon_base: {
            id: 'space-moon_base',
            title: 'Moon Base',
            desc: '<div>Build a moon base</div><div class="has-text-special">Requires Power & Oil</div>',
            reqs: { space: 3 },
            cost: {
                Money(){ return costMultiplier('moon_base', 22000, 1.35); },
                Cement(){ return costMultiplier('moon_base', 18000, 1.35); },
                Alloy(){ return costMultiplier('moon_base', 7800, 1.35); },
                Polymer(){ return costMultiplier('moon_base', 12500, 1.35); }
            },
            effect(){
                let iridium = spatialReasoning(500);
                return `<div>+3 Moon Support</div><div>+${iridium} Max Iridium</div><div>-1 Oil/s, -5kW</div>`;
            },
            support: 3,
            powered: 5,
            action(){
                if (payCosts(spaceProjects.spc_moon.moon_base.cost)){
                    global.space['moon_base'].count++;
                    global.resource.Iridium.display = true;
                    global.resource['Helium_3'].display = true;
                    if (global.city.power >= 5){
                        global.space['moon_base'].on++;
                    }
                    if (global.space['moon_base'].count === 1){
                        global.tech['moon'] = 1;
                    }
                    return true;
                }
                return false;
            }
        },
    },
};

export function spaceTech(){
    return spaceProjects;
}

function checkRequirements(region,action){
    var isMet = true;
    Object.keys(spaceProjects[region][action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < spaceProjects[region][action].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && spaceProjects[region][action].grant && (global.tech[spaceProjects[region][action].grant[0]] && global.tech[spaceProjects[region][action].grant[0]] >= spaceProjects[region][action].grant[1])){
        isMet = false;
    }
    return isMet;
}

export function space(){
    let parent = $('#space');
    parent.empty();
    if (!global.settings.showSpace){
        return false;
    }

    Object.keys(spaceProjects).forEach(function (region){
        let show = region.replace("spc_","");
        if (global.settings.space[`${show}`]){
            let name = typeof spaceProjects[region].info.name === 'string' ? spaceProjects[region].info.name : spaceProjects[region].info.name();
            let desc = typeof spaceProjects[region].info.desc === 'string' ? spaceProjects[region].info.desc : spaceProjects[region].info.desc();
            
            if (spaceProjects[region].info['support']){
                let support = spaceProjects[region].info['support'];
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><span class="name has-text-warning">${name}</span> <span>{{ support }}/{{ on | max }}</span></div></div>`);
                vues[`sr${region}`] = new Vue({
                    data: global.space[support],
                    filters: {
                        max(ct){
                            return ct * spaceProjects[region][support].support;
                        }
                    }
                });
                vues[`sr${region}`].$mount(`#sr${region}`);
            }
            else {
                parent.append(`<div id="${region}" class="space"><div><span class="name has-text-warning">${name}</span></div></div>`);
            }
            
            $(`#${region} span.name`).on('mouseover',function(){
                var popper = $(`<div id="pop${region}" class="popper has-background-light has-text-dark"></div>`);
                $('#main').append(popper);
                
                popper.append($(`<div>${desc}</div>`));
                popper.show();
                poppers[region] = new Popper($(`#${region} span.name`),popper);
            });
            $(`#${region} span.name`).on('mouseout',function(){
                $(`#pop${region}`).hide();
                poppers[region].destroy();
                $(`#pop${region}`).remove();
            });

            Object.keys(spaceProjects[region]).forEach(function (tech){
                if (tech !== 'info' && checkRequirements(region,tech)){
                    let c_action = spaceProjects[region][tech];
                    setAction(c_action,'space',tech);
                }
            });
        }
    });
}

function costMultiplier(action,base,mutiplier){
    if (global.genes['creep']){
        mutiplier -= global.genes['creep'] * 0.01;
    }
    if (mutiplier < 0.01){
        mutiplier = 0.01;
    }
    var count = global.space[action] ? global.space[action].count : 0;
    return Math.round((mutiplier ** count) * base);
}
