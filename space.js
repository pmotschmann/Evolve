import { global, vues, poppers, messageQueue, p_on } from './vars.js';
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
                Oil(){ return costMultiplier('satellite', fuel_adjust(5000), 1.35); },
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
            desc(){
                if (global.space['gps'].count < 4){
                    return '<div>Launch a GPS satellite</div><div class="has-text-special">Requires minimum 4 satellites</div>';
                }
                else {
                    return '<div>Launch a GPS satellite</div>';
                }
            },
            reqs: { satellite: 1 },
            cost: {
                Money(){ return costMultiplier('gps', 75000, 1.3); },
                Knowledge(){ return costMultiplier('gps', 50000, 1.3); },
                Copper(){ return costMultiplier('gps', 6500, 1.3); },
                Oil(){ return costMultiplier('gps', fuel_adjust(3500), 1.3); },
                Titanium(){ return costMultiplier('gps', 8000, 1.3); }
            },
            effect(){
                if (global.space['gps'].count < 4){
                    return `You need a minimum of 4 GPS satellites to establish a GPS signal. The first 3 effectively do nothing.`;
                }
                else {
                    return 'Increases the profitability of trade routes by 1% through improved trade efficency.';
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
                Oil(){ return costMultiplier('propellant_depot', fuel_adjust(5500), 1.35); },
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
                return `The moon orbiting ${home}. It is about 1/10th the mass of ${home} and has no atmosphere.`;
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
                Oil(){ return +fuel_adjust(12000).toFixed(0); }
            },
            effect: 'Launch a mission to survey the moon.',
            action(){
                if (payCosts(spaceProjects.spc_moon.moon_mission.cost)){
                    global.space['iridium_mine'] = {
                        count: 0,
                        on: 0
                    };
                    global.space['helium_mine'] = {
                        count: 0,
                        on: 0
                    };
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
                Money(){ return costMultiplier('moon_base', 22000, 1.32); },
                Cement(){ return costMultiplier('moon_base', 18000, 1.32); },
                Alloy(){ return costMultiplier('moon_base', 7800, 1.32); },
                Polymer(){ return costMultiplier('moon_base', 12500, 1.32); }
            },
            effect(){
                let iridium = spatialReasoning(500);
                let oil = +(fuel_adjust(2)).toFixed(2);
                return `<div>+2 Moon Support</div><div>+${iridium} Max Iridium</div><div>-${oil} Oil/s, -${spaceProjects.spc_moon.moon_base.powered}kW</div>`;
            },
            support: 2,
            powered: 4,
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
        iridium_mine: {
            id: 'space-iridium_mine',
            title: 'Iridium Mine',
            desc: '<div>Mine Iridium from lunar craters</div><div class="has-text-special">Requires Moon Support</div>',
            reqs: { space: 3 },
            cost: {
                Money(){ return costMultiplier('iridium_mine', 42000, 1.35); },
                Lumber(){ return costMultiplier('iridium_mine', 9000, 1.35); },
                Titanium(){ return costMultiplier('iridium_mine', 17500, 1.35); }
            },
            effect(){
                return `<div>-1 Moon Support</div><div>+0.035 Iridium Production</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_moon.iridium_mine.cost)){
                    global.space['iridium_mine'].count++;
                    global.resource['Mythril'].display = true;
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['iridium_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        helium_mine: {
            id: 'space-helium_mine',
            title: 'Helium 3 Mine',
            desc: '<div>Extract Helium 3 from</div><div>the lunar surface</div><div class="has-text-special">Requires Moon Support</div>',
            reqs: { space: 3 },
            cost: {
                Money(){ return costMultiplier('helium_mine', 38000, 1.35); },
                Copper(){ return costMultiplier('helium_mine', 9000, 1.35); },
                Steel(){ return costMultiplier('helium_mine', 17500, 1.35); }
            },
            effect(){
                let storage = spatialReasoning(100);
                return `<div>-1 Moon Support</div><div>+0.15 Helium-3 Production</div><div>+${storage} Max Helium-3</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_moon.helium_mine.cost)){
                    global.space['helium_mine'].count++;
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['helium_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        observatory: {
            id: 'space-observatory',
            title: 'Observatory',
            desc: '<div>Moon based Observatory</div><div class="has-text-special">Requires Moon Support</div>',
            reqs: { science: 9 },
            cost: {
                Money(){ return costMultiplier('observatory', 200000, 1.35); },
                Knowledge(){ return costMultiplier('observatory', 72000, 1.35); },
                Stone(){ return costMultiplier('observatory', 125000, 1.35); },
                Iron(){ return costMultiplier('observatory', 65000, 1.35); },
                Iridium(){ return costMultiplier('observatory', 1250, 1.35); }
            },
            effect(){
                return `<div>-1 Moon Support</div><div>+5000 Max Knowledge</div><div>+5% University Max Knowledge</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_moon.observatory.cost)){
                    global.space['observatory'].count++;
                    if (global.space.moon_base.support < global.space.moon_base.s_max){
                        global.space['observatory'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_red: {
        info: {
            name(){
                return races[global.race.species].solar.red;
            },
            desc(){
                return `The red planet ${races[global.race.species].solar.red} orbits the sun at a distance of about 1.4AU.`;
            },
            support: 'spaceport',
        },
        red_mission: {
            id: 'space-red_mission',
            title(){
                return `${races[global.race.species].solar.red} Mission`;
            },
            desc(){
                return `Launch the ${races[global.race.species].solar.red} Mission`;
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['space',4],
            cost: { 
                Helium_3(){ return +fuel_adjust(4500).toFixed(0); }
            },
            effect(){
                return `Launch a mission to survey the red planet ${races[global.race.species].solar.red}.`;
            },
            action(){
                if (payCosts(spaceProjects.spc_red.red_mission.cost)){
                    global.space['living_quarters'] = {
                        count: 0,
                        on: 0
                    };
                    global.space['garage'] = { count: 0 };
                    global.space['red_mine'] = {
                        count: 0,
                        on: 0
                    };
                    global.space['greenhouse'] = {
                        count: 0,
                        on: 0
                    };
                    global.space['fabrication'] = {
                        count: 0,
                        on: 0
                    };
                    global.space['laboratory'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        spaceport: {
            id: 'space-spaceport',
            title: 'Spaceport',
            desc: '<div>Build an Spaceport</div><div class="has-text-special">Requires Power & Helium-3</div>',
            reqs: { space: 4 },
            cost: {
                Money(){ return costMultiplier('spaceport', 47500, 1.35); },
                Iridium(){ return costMultiplier('spaceport', 1750, 1.35); },
                Mythril(){ return costMultiplier('spaceport', 25, 1.35); },
                Titanium(){ return costMultiplier('spaceport', 22500, 1.35); }
            },
            effect(){
                let helium = +(fuel_adjust(1.25)).toFixed(2);
                return `<div>+3 ${races[global.race.species].solar.red} Support</div><div>-${helium} Helium-3/s, -${spaceProjects.spc_red.spaceport.powered}kW</div>`;
            },
            support: 3,
            powered: 5,
            action(){
                if (payCosts(spaceProjects.spc_red.spaceport.cost)){
                    global.space['spaceport'].count++;
                    global.resource.Iridium.display = true;
                    global.resource['Helium_3'].display = true;
                    if (global.city.power >= 5){
                        global.space['spaceport'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        living_quarters: {
            id: 'space-living_quarters',
            title: 'Living Quarters',
            desc(){
                return `<div>Provides living space for colonists</div><div class="has-text-special">Requires ${races[global.race.species].solar.red} Support</div>`;
            },
            reqs: { space: 4 },
            cost: {
                Money(){ return costMultiplier('living_quarters', 38000, 1.35); },
                Steel(){ return costMultiplier('living_quarters', 15000, 1.35); },
                Polymer(){ return costMultiplier('living_quarters', 9500, 1.35); }
            },
            effect(){
                return `<div>-1 ${races[global.race.species].solar.red} Support</div><div>+1 Max Colonist</div><div>+1 Max Citizen</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_red.living_quarters.cost)){
                    global.space['living_quarters'].count++;
                    global.civic.colonist.display = true;
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['living_quarters'].on++;
                        global['resource'][races[global.race.species].name].max += 1;
                    }
                    return true;
                }
                return false;
            }
        },
        garage: {
            id: 'space-garage',
            title: 'Garage',
            desc(){
                return `<div>Provides storage for the colony</div>`;
            },
            reqs: { space: 4 },
            cost: {
                Money(){ return costMultiplier('garage', 75000, 1.35); },
                Iron(){ return costMultiplier('garage', 12000, 1.35); },
                Brick(){ return costMultiplier('garage', 3000, 1.35); },
                Sheet_Metal(){ return costMultiplier('garage', 1500, 1.35); }
            },
            effect(){
                let multiplier = 1;
                let copper = +(spatialReasoning(6500) * multiplier).toFixed(0);
                let iron = +(spatialReasoning(5500) * multiplier).toFixed(0);
                let cement = +(spatialReasoning(6000) * multiplier).toFixed(0);
                let steel = +(spatialReasoning(4500) * multiplier).toFixed(0);
                let titanium = +(spatialReasoning(3500) * multiplier).toFixed(0);
                let alloy = +(spatialReasoning(2500) * multiplier).toFixed(0);
                return `<div>+20 Max Containers</div><div>+${copper} Max Copper</div><div>+${iron} Max Iron</div><div>+${cement} Max Cement</div><div>+${steel} Max Steel</div><div>+${titanium} Max Titanium</div><div>+${alloy} Max Alloy</div>`;
            },
            action(){
                if (payCosts(spaceProjects.spc_red.garage.cost)){
                    global.space['garage'].count++;
                    let multiplier = 1;
                    global['resource']['Copper'].max += (spatialReasoning(6500) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(5500) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(6000) * multiplier);
                    global['resource']['Steel'].max += (spatialReasoning(4500) * multiplier);
                    global['resource']['Titanium'].max += (spatialReasoning(3500) * multiplier);
                    global['resource']['Alloy'].max += (spatialReasoning(2500) * multiplier);
                    return true;
                }
                return false;
            }
        },
        red_mine: {
            id: 'space-red_mine',
            title: 'Mine',
            desc(){
                return `<div>Mining Facility</div><div class="has-text-special">Requires ${races[global.race.species].solar.red} Support</div>`;
            },
            reqs: { space: 4 },
            cost: {
                Money(){ return costMultiplier('red_mine', 50000, 1.35); },
                Lumber(){ return costMultiplier('red_mine', 65000, 1.35); },
                Iron(){ return costMultiplier('red_mine', 33000, 1.35); }
            },
            effect(){
                return `<div>+0.25 Copper per colonist</div><div>+0.02 Titanium per colonist</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_red.red_mine.cost)){
                    global.space['red_mine'].count++;
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['red_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        fabrication: {
            id: 'space-fabrication',
            title: 'Fabrication',
            desc(){
                return `<div>Fabrication Plant</div><div class="has-text-special">Requires ${races[global.race.species].solar.red} Support</div>`;
            },
            reqs: { space: 4 },
            cost: {
                Money(){ return costMultiplier('fabrication', 90000, 1.35); },
                Copper(){ return costMultiplier('fabrication', 25000, 1.35); },
                Cement(){ return costMultiplier('fabrication', 12000, 1.35); },
                Wrought_Iron(){ return costMultiplier('fabrication', 1200, 1.35); }
            },
            effect(){
                return `<div>+2% Crafted Materials per colonist</div>`;
            },
            support: -1,
            powered: 1,
            action(){
                if (payCosts(spaceProjects.spc_red.fabrication.cost)){
                    global.space['fabrication'].count++;
                    if (global.space.spaceport.support < global.space.spaceport.s_max){
                        global.space['fabrication'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
    },
    spc_hell: {
        info: {
            name(){
                return races[global.race.species].solar.hell;
            },
            desc(){
                return `The planet ${races[global.race.species].solar.hell} is located about 0.4AU from the sun and is very hot.`;
            },
        },
        hell_mission: {
            id: 'space-hell_mission',
            title(){
                return `${races[global.race.species].solar.hell} Mission`;
            },
            desc(){
                return `Launch the ${races[global.race.species].solar.hell} Mission`;
            },
            reqs: { space: 3, space_explore: 3 },
            grant: ['hell',1],
            cost: { 
                Helium_3(){ return +fuel_adjust(6500).toFixed(0); }
            },
            effect(){
                return `Launch a mission to survey the hellish planet ${races[global.race.species].solar.hell}.`;
            },
            action(){
                if (payCosts(spaceProjects.spc_hell.hell_mission.cost)){
                    global.space['geothermal'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        geothermal: {
            id: 'space-geothermal',
            title: 'Geothermal Plant',
            desc(){
                return `<div>Geothermal Energy Plant</div><div class="has-text-special">Requires Helium-3</div>`;
            },
            reqs: { hell: 1 },
            cost: {
                Money(){ return costMultiplier('geothermal', 38000, 1.35); },
                Steel(){ return costMultiplier('geothermal', 15000, 1.35); },
                Polymer(){ return costMultiplier('geothermal', 9500, 1.35); }
            },
            effect(){
                let helium = +(fuel_adjust(0.75)).toFixed(2);
                return `+8kW, -${helium} Helium-3/s`;
            },
            powered: -8,
            action(){
                if (payCosts(spaceProjects.spc_hell.geothermal.cost)){
                    global.space['geothermal'].count++;
                    global.space['geothermal'].on++;
                    return true;
                }
                return false;
            }
        },
    }
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
                parent.append(`<div id="${region}" class="space"><div id="sr${region}"><span class="name has-text-warning">${name}</span> <span>{{ support }}/{{ s_max }}</span></div></div>`);
                vues[`sr${region}`] = new Vue({
                    data: global.space[support]
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

export function fuel_adjust(fuel){
    if (global.city['mass_driver'] && p_on['mass_driver']){
        fuel *= 0.95 ** p_on['mass_driver'];
    }
    return fuel;
}
