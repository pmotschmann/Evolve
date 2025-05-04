import { global, seededRandom, p_on, support_on, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { races, traits, fathomCheck, blubberFill } from './races.js';
import { govTitle, garrisonSize, armyRating } from './civics.js';
import { housingLabel, drawTech, actions } from './actions.js';
import { flib, drawPet } from './functions.js';
import { tradeRatio } from './resources.js';
import { checkControlling, soldierDeath } from './civics.js';
import { govActive } from './governor.js';
import { unlockAchieve } from './achieve.js';
import { jobScale } from './jobs.js';

export const events = {
    dna_replication: {
        reqs: {
            race: 'protoplasm',
            resource: 'DNA'
        },
        type: 'major',
        effect(){
            var gain = Math.rand(1,Math.round(global.resource.DNA.max / 3));
            var res = global.resource.DNA.amount + gain;
            if (res > global.resource.DNA.max){ res = global.resource.DNA.max; }
            global.resource.DNA.amount = res;
            return loc('event_dna',[gain.toLocaleString()]);
        }
    },
    rna_meteor: {
        reqs: {
            race: 'protoplasm',
            resource: 'RNA'
        },
        type: 'major',
        effect(){
            var gain = Math.rand(1,Math.round(global.resource.RNA.max / 2));
            var res = global.resource.RNA.amount + gain;
            if (res > global.resource.RNA.max){ res = global.resource.RNA.max; }
            global.resource.RNA.amount = res;
            return loc('event_rna',[gain.toLocaleString()]);
        }
    },
    inspiration: {
        reqs: {
            resource: 'Knowledge'
        },
        type: 'major',
        effect(){
            global.race['inspired'] = Math.rand(300,600);
            return loc('event_inspiration');
        }
    },
    motivation: {
        reqs: {
            tech: 'primitive',
        },
        type: 'major',
        effect(){
            global.race['motivated'] = Math.rand(300,600);
            return loc('event_motivation');
        }
    },
    fire: {
        reqs: {
            resource: 'Lumber',
            nogenus: 'aquatic',
            notrait: 'evil'
        },
        type: 'major',
        effect(){
            var loss = Math.rand(1,Math.round(global.resource.Lumber.amount / 4));
            var res = global.resource.Lumber.amount - loss;
            if (res < 0){ res = 0; }
            global.resource.Lumber.amount = res;
            return loc('event_fire',[loss.toLocaleString()]);
        }
    },
    flare: {
        reqs: {
            tech: 'primitive',
        },
        type: 'major',
        condition(){
            return global.city.ptrait.includes('flare') ? true : false;
        },
        effect(wiki){
            let at_risk = 0;
            let planet = races[global.race.species].home;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                if (global.space.hasOwnProperty('living_quarters')){
                    let num_lq_on = wiki ? global.space.living_quarters.on : support_on['living_quarters'];
                    at_risk += Math.round(num_lq_on * actions.space.spc_red.living_quarters.citizens());
                }
                planet = races[global.race.species].solar.red;
            }
            else {
                if (global.city.hasOwnProperty('basic_housing')){
                    at_risk += global.city.basic_housing.count * actions.city.basic_housing.citizens();
                }
                if (global.city.hasOwnProperty('cottage')){
                    at_risk += global.city.cottage.count * actions.city.cottage.citizens();
                }
                if (global.city.hasOwnProperty('apartment')){
                    let num_apartment_on = wiki ? global.city.apartment.on : p_on['apartment'];
                    at_risk += num_apartment_on * actions.city.apartment.citizens();
                }
            }
            if (at_risk > global.resource[global.race.species].amount){
                at_risk = global.resource[global.race.species].amount;
            }
            at_risk = Math.floor(at_risk * 0.1);

            let loss = Math.rand(0,at_risk);
            global.resource[global.race.species].amount -= loss;
            global.civic[global.civic.d_job].workers -= loss;
            if (global.civic[global.civic.d_job].workers < 0){
                global.civic[global.civic.d_job].workers = 0;
            }

            if (global.city.biome !== 'oceanic'){
                let time = 400;
                if (global.city.biome === 'forest'){
                    time *= 2;
                }
                else if (global.city.biome === 'desert' || global.city.biome === 'volcanic'){
                    time /= 2;
                }
                global.city['firestorm'] = Math.rand(time,time * 10);
            }

            return loc(global.city.biome === 'oceanic' ? 'event_flare2' : 'event_flare',[planet, loss.toLocaleString()]);
        }
    },
    raid: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (checkControlling(`gov0`) && checkControlling(`gov1`) && checkControlling(`gov2`)){
                return false;
            }
            return !global.race['truepath'] && !global.race['cataclysm'] && (global.civic.foreign.gov0.hstl > 60 || global.civic.foreign.gov1.hstl > 60 || global.civic.foreign.gov2.hstl > 60) ? true : false;
        },
        effect(){
            let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
            let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
            let enemy = Math.rand(25,50) * eAdv;

            let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
            let killed =  Math.floor(seededRandom(0,injured));
            let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));
            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (army > enemy){
                return loc('event_raid1',[killed.toLocaleString(),wounded.toLocaleString()]);
            }
            else {
                let loss = Math.rand(1,Math.round(global.resource.Money.amount / 4));
                if (loss <= 0){
                    return loc('event_raid1',[killed.toLocaleString(),wounded.toLocaleString()]);
                }
                else {
                    let res = global.resource.Money.amount - loss;
                    if (res < 0){ res = 0; }
                    global.resource.Money.amount = res;
                    return loc('event_raid2',[loss.toLocaleString(),killed.toLocaleString(),wounded.toLocaleString()]);
                }
            }
        }
    },
    siege: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (checkControlling(`gov0`) || checkControlling(`gov1`) || checkControlling(`gov2`)){
                return false;
            }
            return !global.race['truepath'] && global.civic.foreign.gov0.hstl > 80 && global.civic.foreign.gov1.hstl > 80 && global.civic.foreign.gov2.hstl > 80 ? true : false;
        },
        effect(){
            let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
            let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
            let enemy = (global.civic.foreign.gov0.mil + global.civic.foreign.gov1.mil + global.civic.foreign.gov2.mil) * eAdv;

            let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
            let killed =  Math.floor(seededRandom(0,injured));
            let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));

            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (army > enemy){
                return loc('event_siege1',[killed.toLocaleString(),wounded.toLocaleString()]);
            }
            else {
                var loss = Math.rand(1,Math.round(global.resource.Money.amount / 2));
                var res = global.resource.Money.amount - loss;
                if (res < 0){ res = 0; }
                global.resource.Money.amount = res;
                return loc('event_siege2',[loss.toLocaleString(),killed.toLocaleString(),wounded.toLocaleString()]);
            }
        }
    },
    pillage0: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov0`) && global.civic.foreign.gov0.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov0`);
        }
    },
    pillage1: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov1`) && global.civic.foreign.gov1.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov1`);
        }
    },
    pillage2: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov2`) && global.civic.foreign.gov2.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov2`);
        }
    },
    pillage3: {
        reqs: {
            tech: 'military',
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && global.tech['rival'] && global.civic.foreign.gov3.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov3`,true);
        }
    },
    witch_hunt_crusade: {
        reqs: {
            tech: 'magic',
        },
        type: 'major',
        condition(){
            return global.race['witch_hunter'] && global.resource.Sus.amount >= 100 ? true : false;
        },
        effect(){
            return pillaged(`witchhunt`,true);
        }
    },
    terrorist: {
        reqs: {
            tech: 'world_control',
            notrait: 'truepath'
        },
        type: 'major',
        effect(){            
            let killed = Math.floor(seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(seededRandom(0,global.civic.garrison.workers - global.civic.garrison.wounded));
            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += 1000;
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (killed === 0){
                return loc('event_terrorist1',[wounded.toLocaleString()]);
            }
            else {
                return loc('event_terrorist2',[wounded.toLocaleString(),killed.toLocaleString()]);
            }
        }
    },
    quake: {
        reqs: {
            tech: 'wsc',
            notech: 'quaked'
        },
        type: 'major',
        condition(){
            return global.city.ptrait.includes('unstable') ? true : false;
        },
        effect(){
            global.tech['quaked'] = 1;
            drawTech();
            return loc('event_quake',[global.race['cataclysm'] || global.race['orbit_decayed'] ? races[global.race.species].solar.red : races[global.race.species].home]);
        }
    },
    doom: {
        reqs: {
            tech: 'wsc',
            notech: 'portal_guard'
        },
        type: 'major',
        condition(){
            return global.space['space_barracks'] && global.space.space_barracks.on > 0 ? true : false;
        },
        effect(){
            unlockAchieve('doomed');
            global.stats.portals++;
            return loc(global.race['evil'] ? 'event_doom_alt' : 'event_doom',[races[global.race.species].solar.dwarf]);
        }
    },
    demon_influx: {
        reqs: {
            tech: 'portal_guard'
        },
        type: 'major',
        effect(){
            let surge = Math.rand(2500,5000);
            global.portal.fortress.threat += surge;
            return loc('event_demon_influx',[surge.toLocaleString()]);
        }
    },
    ruins: {
        reqs: {
            trait: 'ancient_ruins',
            resource: 'Knowledge'
        },
        type: 'major',
        effect(){
            let resources = ['Iron','Copper','Steel','Cement'];
            for (var i = 0; i < resources.length; i++){
                let res = resources[i];
                if (global.resource[res].display){
                    let gain = Math.rand(1,Math.round(global.resource[res].max / 4));
                    if (global.resource[res].amount + gain > global.resource[res].max){
                        global.resource[res].amount = global.resource[res].max;
                    }
                    else {
                        global.resource[res].amount += gain;
                    }
                }
            }
            return loc('event_ruins');
        }
    },
    tax_revolt: {
        reqs: {
            low_morale: 99,
            notrait: 'blissful',
            tech: 'primitive'
        },
        type: 'major',
        condition(){
            let threshold = global.civic.govern.type === 'oligarchy' ? 45 : 25;
            let aristoVal = govActive('aristocrat',2);
            if (aristoVal){
                threshold -= aristoVal;
            }
            return global.civic.taxes.tax_rate > threshold;
        },
        effect(){
            return tax_revolt();
        }
    },
    slave_death1: slaveLoss('major','death1'),
    slave_death2: slaveLoss('major','death2'),
    slave_death3: slaveLoss('major','death3'),
    protest: {
        reqs: {
            tech: 'primitive'
        },
        type: 'major',
        condition(){
            return global.civic.govern.type === 'republic' ? true : false;
        },
        effect(){
            global.civic.govern['protest'] = Math.rand(30,60);
            switch(Math.rand(0,10)){
                case 0:
                    return loc('event_protest0',[housingLabel('small')]);
                case 1:
                    return loc('event_protest1');
                case 2:
                    return loc('event_protest2');
                case 3:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest3');
                case 4:
                    return loc('event_protest4');
                case 5:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest5');
                case 6:
                    return loc('event_protest6');
                case 7:
                    return loc('event_protest7');
                case 8:
                    return loc('event_protest8');
                case 9:
                    global.civic.govern['protest'] = Math.rand(60,90);
                    return loc('event_protest9');
            }
        }
    },
    scandal: {
        reqs: {
            tech: 'govern'
        },
        type: 'major',
        condition(){
            return govActive('muckraker',0) ? true : false;
        },
        effect(){
            global.civic.govern['scandal'] = Math.rand(15,90);
            switch(Math.rand(0,10)){
                case 0:
                    return loc('event_scandal0');
                case 1:
                    return loc('event_scandal1');
                case 2:
                    return loc('event_scandal2');
                case 3:
                    return loc('event_scandal3');
                case 4:
                    return loc('event_scandal4');
                case 5:
                    return loc('event_scandal5');
                case 6:
                    return loc('event_scandal6');
                case 7:
                    return loc('event_scandal7');
                case 8:
                    return loc('event_scandal8');
                case 9:
                    return loc('event_scandal9');
            }
        }
    },
    spy: {
        reqs: {
            tech: 'primitive',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (global.race['elusive']){
                return false;
            }
            let fathom = fathomCheck('satyr');
            if (fathom > 0.25){
                return false;
            }
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].spy > 0 && !global.civic.foreign[`gov${i}`].occ && !global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy){
                    return true;
                }
            }
            return false;
        },
        effect(){
            let govs = [];
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].spy > 0 && !global.civic.foreign[`gov${i}`].occ && !global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy){
                    govs.push(i);
                }
            }
            let gov = govs[Math.rand(0,govs.length)];
            global.civic.foreign[`gov${gov}`].spy--;
            if (global.civic.foreign[`gov${gov}`].spy === 0) {
                global.civic.foreign[`gov${gov}`].act = 'none';
                global.civic.foreign[`gov${gov}`].sab = 0;
            }
            
            return loc('event_spy',[govTitle(gov)]);
        }
    },
    mine_collapse: {
        reqs: {
            tech: 'mining',
        },
        type: 'major',
        condition(){
            if (global.resource[global.race.species].amount > 0 && global.civic.miner.workers > 0){
                return true;
            }
            return false;
        },
        effect(){
            global.resource[global.race.species].amount--;
            global.civic.miner.workers--;
            blubberFill(1);
            return loc('event_mine_collapse');
        }
    },
    klepto: {
        reqs: {
            trait: 'rogue',
            resource: 'Money'
        },
        type: 'major',
        effect(){
            let stealList = [];
            [
                'Money','Food','Lumber','Stone','Chrysotile','Crystal','Furs','Copper','Iron',
                'Cement','Coal','Uranium','Aluminium','Steel','Titanium','Alloy','Polymer','Iridium',
                'Neutronium','Adamantite','Infernite','Elerium','Nano_Tube','Graphene','Stanene',
                'Bolognium','Vitreloy','Orichalcum','Asphodel_Powder','Elysanite','Unobtainium','Quantium',
                'Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite'
            ].forEach(function(r){
                if (global.resource[r].display){
                    stealList.push(r);
                }
            });

            let maxRoll = Math.round(global.stats.know / 25);
            let res = stealList[Math.floor(seededRandom(0,stealList.length))];
            if (global.resource[res].max > 0 && maxRoll > global.resource[res].max * traits.rogue.vars()[0] / 100){
                maxRoll = Math.round(global.resource[res].max * traits.rogue.vars()[0] / 100);
            }

            let gain = Math.floor(seededRandom(1,maxRoll));
            if (global.resource[res].max !== -1 && global.resource[res].amount + gain > global.resource[res].max){
                global.resource[res].amount = global.resource[res].max;
            }
            else {
                global.resource[res].amount += gain;
            }

            return res === 'Money' ? loc('event_klepto_money',[gain]) : loc('event_klepto',[gain,global.resource[res].name]);
        }
    },
    chicken_feast:{ 
        reqs: {
            tech: 'primitive',
            trait: 'chicken'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            let dead = Math.floor(seededRandom(2,jobScale(10)));
            let type = Math.floor(seededRandom(0,10));
            if (dead > global.resource[global.race.species].amount){ dead = global.resource[global.race.species].amount; }
            global.resource[global.race.species].amount -= dead;
            blubberFill(dead);
            if(type === 7){
                return loc('event_chicken',[loc(`event_chicken_eaten${type}`, [flib('name')]),dead,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
            }
            return loc('event_chicken',[loc(`event_chicken_eaten${type}`),dead,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
        }
    },
    brawl:{ 
        reqs: {
            tech: 'primitive',
            trait: 'aggressive'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            let dead = Math.floor(seededRandom(1,jobScale(traits.aggressive.vars()[0] + 1)));
            if (dead > global.civic.garrison.workers){ dead = global.civic.garrison.workers; }
            soldierDeath(dead);
            return loc('event_brawl_s',[loc(`event_brawl${Math.floor(seededRandom(0,10))}`),dead]);
        }
    },
    m_curious: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        condition(){
            if (global.resource[global.race.species].amount >= 40){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            switch (Math.rand(0,5)){
                case 0:
                    {
                        let res = 'Money';
                        let vol = Math.rand(50000,5000000);
                        switch (Math.rand(0,5)){
                            case 0:
                                if (global.resource.Steel.display){
                                    res = 'Steel';
                                    vol = Math.rand(100,100000);
                                }
                                break;
                            case 1:
                                if (global.resource.Bolognium.display){
                                    res = 'Bolognium';
                                    vol = Math.rand(500,50000);
                                }
                                break;
                            case 2:
                                if (global.resource.Alloy.display){
                                    res = 'Alloy';
                                    vol = Math.rand(250,1000000);
                                }
                                break;
                            case 3:
                                if (global.resource.Adamantite.display){
                                    res = 'Adamantite';
                                    vol = Math.rand(1000,250000);
                                }
                                break;
                            case 4:
                                if (global.resource.Soul_Gem.display){
                                    res = 'Soul_Gem';
                                    vol = 1;
                                }
                                break;
                        }
                        global.resource[res].amount += vol;
                        if (global.resource[res].max >= 0 && global.resource[res].amount > global.resource[res].max){
                            global.resource[res].amount = global.resource[res].max;
                        }
                        if (res === 'Money'){
                            return loc(`event_m_curious0`,[races[global.race.species].name,'$',vol.toLocaleString()]);
                        }
                        return loc(`event_m_curious0`,[races[global.race.species].name,vol.toLocaleString(),global.resource[res].name]);
                    }
                case 1:
                    {
                        global.resource[global.race.species].amount -= 10;
                        global.civic[global.civic.d_job].workers -= 10;
                        if (global.civic[global.civic.d_job].workers < 0){
                            global.civic[global.civic.d_job].workers = 0;
                        }
                        return loc(`event_m_curious1`,[races[global.race.species].name]);
                    }
                case 2:
                    {
                        global.race['inspired'] = Math.rand(600,1200);
                        return loc(`event_m_curious2`,[races[global.race.species].name]);
                    }
                case 3:
                    {
                        global.race['distracted'] = Math.rand(200,600);
                        return loc(`event_m_curious3`,[races[global.race.species].name]);
                    }
                case 4:
                    {
                        if (global.race.species === 'cath'){
                            global.race['stimulated'] = Math.rand(500,1000);
                            return loc(`event_m_curious4a`,[races[global.race.species].name]);
                        }
                        else {
                            return loc(`event_m_curious4b`,[races[global.race.species].name]);
                        }
                    }
            }
        }
    },
    curious1: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        type: 'minor',
        effect(){
            let num = Math.rand(0,5);
            return loc(`event_curious${num}`,[races[global.race.species].name]);
        }
    },
    curious2: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        type: 'minor',
        effect(){
            let num = Math.rand(5,10);
            return loc(`event_curious${num}`,[races[global.race.species].name]);
        }
    },
    slave_escape1: slaveLoss('minor','escape1'),
    slave_escape2: slaveLoss('minor','escape2'),
    slave_escape3: slaveLoss('minor','death4'),
    shooting_star: basicEvent('shooting_star','primitive'),
    tumbleweed: basicEvent('tumbleweed','primitive'),
    flashmob: basicEvent('flashmob','high_tech'),
    witch_hunt: {
        reqs: {
            tech: 'magic',
        },
        type: 'minor',
        condition(){
            return global.race['witch_hunter'] && global.resource.Sus.amount >= 50 && global.civic.scientist.workers > 0 ? true : false;
        },
        effect(){
            global.resource[global.race.species].amount--;
            global.civic.scientist.workers--;
            global.civic.scientist.assigned--;
            blubberFill(1);
            return loc(`witch_hunter_witch_hunt`);
        }
    },
    chicken:{ 
        reqs: {
            tech: 'primitive',
            trait: 'chicken'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'minor',
        effect(){
            global.resource[global.race.species].amount--;
            blubberFill(1);
            return loc('event_chicken',[loc(`event_chicken_eaten${Math.rand(0,10)}`),1,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
        }
    },
    fight:{ 
        reqs: {
            tech: 'primitive',
            trait: 'aggressive'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'minor',
        effect(){
            let dead = Math.floor(seededRandom(1,jobScale(traits.aggressive.vars()[1] + 1)));
            if (dead > global.resource[global.race.species].amount){ dead = global.resource[global.race.species].amount; }
            global.resource[global.race.species].amount -= dead;
            blubberFill(dead);
            return loc('event_brawl_c',[loc(`event_brawl${Math.floor(seededRandom(0,10))}`),dead]);
        }
    },
    heatwave: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            // No planet or already hot
            if (global.race['cataclysm'] || global.race['orbit_decayed'] || global.city.calendar.temp === 2){
                return false;
            }
            // Winter on tundra or taiga biome is always cold
            // Eden is idyllic, so normally cannot be hot except in summer. For heat wave, allow in spring, summer, or autumn.
            if (global.city.calendar.season === 3 && ['tundra','taiga','eden'].includes(global.city.biome)){
                return false;
            }
            // Always allow heat wave on other biomes, even during winter
            return true;
        },
        effect(){
            global.city.calendar.temp = 2;
            global.city.cold = 0;
            return loc('event_heatwave');
        }
    },
    coldsnap: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            // No planet or already cold
            if (global.race['cataclysm'] || global.race['orbit_decayed'] || global.city.calendar.temp === 0){
                return false;
            }
            // Hellscape is never cold (except allow on custom planet hellscape with permafrost)
            if (global.city.biome === 'hellscape' && !global.city.ptrait.includes('permafrost')){
                return false;
            }
            // Summer on volcanic or ashland biome is always hot
            // Eden is idyllic, so normally cannot be cold except in winter. For cold snap, allow in autumn, winter, or spring.
            if (global.city.calendar.season === 1 && ['ashland','volcanic','eden'].includes(global.city.biome)){
                return false;
            }
            // Always allow cold snap on other biomes, even during summer
            return true;
        },
        effect(){
            global.city.calendar.temp = 0;
            global.city.hot = 0;
            return loc('event_coldsnap');
        }
    },
    cucumber: basicEvent('cucumber','primitive'),
    planking: basicEvent('planking','high_tech'),
    furryfish: basicEvent('furryfish','primitive'),
    meteor_shower: basicEvent('meteor_shower','primitive'),
    hum: basicEvent('hum','high_tech'),
    bloodrain: basicEvent('bloodrain','primitive'),
    haunting: basicEvent('haunting','science'),
    mothman: basicEvent('mothman','science'),
    dejavu: basicEvent('dejavu','theology'),
    dollar: basicEvent('dollar','currency',function(){
        let cash = Math.rand(1,10);
        global.resource.Money.amount += cash;
        if (global.resource.Money.amount > global.resource.Money.max){
            global.resource.Money.amount = global.resource.Money.max;
        }
        return cash;
    }),
    pickpocket: basicEvent('pickpocket','currency',function(){
        let cash = Math.rand(1,10);
        global.resource.Money.amount -= cash;
        if (global.resource.Money.amount < 0){
            global.resource.Money.amount = 0;
        }
        return cash;
    }),
    bird: basicEvent('bird','primitive'),
    contest: {
        reqs: {
            tech: 'science',
        },
        type: 'minor',
        effect(){
            let place = Math.rand(0,3);
            let contest = Math.rand(0,10);
            return loc('event_contest',[loc(`event_contest_place${place}`),loc(`event_contest_type${contest}`)]);
        }
    },
    cloud: basicEvent('cloud','primitive',function(){
        let type = Math.rand(0,11);
        return loc(`event_cloud_type${type}`);
    }),
    dark_cloud: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && global.city.calendar.weather !== 0){
                return true;
            }
            return false;
        },
        effect(){
            global.city.calendar.weather = 0;
            return loc('event_dark_cloud');
        }
    },
    gloom: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && global.city.calendar.weather !== 1){
                return true;
            }
            return false;
        },
        effect(){
            global.city.calendar.weather = 1;
            return loc('event_gloom');
        }
    },
    tracks: basicEvent('tracks','primitive'),
    hoax: basicEvent('hoax','primitive'),
    burial: basicEvent('burial','primitive'),
    artifacts: basicEvent('artifacts','high_tech'),
    parade: basicEvent('parade','world_control'),
    crop_circle: basicEvent('crop_circle','agriculture'),
    llama: basicEvent('llama','primitive',function(){
        let food = Math.rand(25,100);
        global.resource.Food.amount -= food;
        if (global.resource.Food.amount < 0){
            global.resource.Food.amount = 0;
        }
        return food;
    },
    function(){
        if (global.race['carnivore'] || global.race['soul_eater'] || global.race['detritivore'] || global.race['artifical']){
            return false;
        }
        return true;
    }),
    cat: basicEvent('cat','primitive'),
    omen: basicEvent('omen','primitive'),
    theft: basicEvent('theft','primitive',function(){
        let thief = Math.rand(0,10);
        return loc(`event_theft_type${thief}`);
    }),
    compass: basicEvent('compass','mining'),
    bone: basicEvent('bone','primitive'),
    delicacy: basicEvent('delicacy','high_tech'),
    prank: basicEvent('prank','primitive',function(){
        let prank = Math.rand(0,10);
        return loc(`event_prank_type${prank}`);
    }),
    graffiti: basicEvent('graffiti','science'),
    soul: basicEvent('soul','soul_eater'),
    cheese: {
        reqs: {
            tech: 'banking',
        },
        type: 'minor',
        condition(){
            if (global.tech['banking'] && global.tech.banking >= 7){
                return true;
            }
            return false;
        },
        effect(){
            let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            global.race['cheese'] = Math.rand(10,10 + resets);
            return loc(`event_cheese`);
        }
    },
    tremor: basicEvent('tremor','primitive'),
    rumor: basicEvent('rumor','primitive',function(){
        let rumor = Math.rand(0,10);
        return loc(`event_rumor_type${rumor}`);
    }),
    pet: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        effect(){
            if (global.race['pet']){
                global.race.pet.event += Math.rand(300,600);
                let interaction = Math.rand(0,10);
                return loc(`event_${global.race.pet.type}_interaction${interaction}`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]);
            }
            else {
                let pet = Math.rand(0,2) === 0 ? 'cat' : 'dog';
                global.race['pet'] = {
                    type: pet,
                    name: pet === 'cat' ? Math.rand(0,12) : Math.rand(0,10),
                    event: 0,
                    pet: 0
                };
                drawPet();
                return loc(`event_pet_${global.race.pet.type}`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]);
            }
        }
    },
};

function basicEvent(title,tech,func,cond){
    return {
        reqs: {
            tech: tech,
        },
        condition(){
            let val = true;
            if (typeof cond === 'function'){
                val = cond();
            }
            return val;
        },
        type: 'minor',
        effect(){
            let val = false;
            if (typeof func === 'function'){
                val = func();
            }
            return val ? loc(`event_${title}`,[val]) : loc(`event_${title}`);
        }
    };
}

function slaveLoss(type,string){
    return {
        reqs: { 
            trait: 'slaver',
            tech: 'slaves'
        },
        condition(){
            return global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] ? false : true;
        },
        type: type,
        effect(){
            if (global.city['slave_pen'] && global.resource.Slave.amount > 0){
                global.resource.Slave.amount--;
                return loc(`event_slave_${string}`);
            }
            else {
                return loc('event_slave_none');
            }
        }
    };
}

function pillaged(gov,serious){
    let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
    let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
    let enemy = (gov === 'witchhunt' ? 1000 : global.civic.foreign[gov].mil) * (1 + Math.floor(seededRandom(0,10) - 5) / 10) * eAdv;

    let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
    let killed = garrisonSize() > 0 ? Math.floor(seededRandom(1,injured)) : 0;
    let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));
    if (global.race['instinct']){
        killed = Math.round(killed / 2);
        wounded = Math.round(wounded / 2);
    }
    soldierDeath(killed);
    global.civic.garrison.wounded += wounded;
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }

    if (global.race['blood_thirst']){
        global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
        if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
            global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
        }
    }

    let enemy_name = gov === 'witchhunt' ? loc(`witch_hunter_crusade`) : loc(`civics_gov${global.civic.foreign[gov].name.s0}`,[global.civic.foreign[gov].name.s1]);

    if (army > enemy){
        return loc('event_pillaged1',[enemy_name,killed.toLocaleString(),wounded.toLocaleString()]);
    }
    else {
        let limiter = serious ? 2 : 4;
        let stolen = [];
        let targets = Object.keys(tradeRatio);
        targets.push('Money');
        targets.forEach(function(res){
            if (global.resource[res] && global.resource[res].display && global.resource[res].amount > 0){
                let loss = Math.rand(1,Math.round(global.resource[res].amount / limiter));
                let remain = global.resource[res].amount - loss;
                if (remain < 0){ remain = 0; }
                global.resource[res].amount = remain;
                if (res === 'Money'){
                    stolen.push(`$${sizeApproximation(loss)}`);
                }
                else {
                    stolen.push(`${sizeApproximation(loss)} ${global.resource[res].name}`);
                }
            }
        });
        return loc('event_pillaged2',[enemy_name,killed.toLocaleString(),wounded.toLocaleString(),stolen.join(', ')]);
    }
}

export function eventList(type){
    let event_pool = [];
    Object.keys(events).forEach(function (event){
        let isOk = true;
        if (type !== events[event].type){
            isOk = false;
        }
        if ((type === 'major' && global.event.l === event) || (type === 'minor' && global.m_event.l === event)){
            isOk = false;
        }
        if (events[event]['reqs']){
            Object.keys(events[event].reqs).forEach(function (req) {
                switch(req){
                    case 'race':
                        if (events[event].reqs[req] !== global.race.species){
                            isOk = false;
                        }
                        break;
                    case 'genus':
                        if (events[event].reqs[req] !== races[global.race.species].type){
                            isOk = false;
                        }
                        break;
                    case 'nogenus':
                        if (events[event].reqs[req] === races[global.race.species].type){
                            isOk = false;
                        }
                        break;
                    case 'resource':
                        if (!global.resource[events[event].reqs[req]] || !global.resource[events[event].reqs[req]].display){
                            isOk = false;
                        }
                        break;
                    case 'trait':
                        if (!global.race[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'notrait':
                        if (global.race[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'tech':
                        if (!global.tech[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;
                    case 'notech':
                        if (global.tech[events[event].reqs[req]]){
                            isOk = false;
                        }
                        break;

                    case 'high_tax_rate':
                        // there are currently no events with the high_tax_rate requirement
                        if (global.civic.taxes.tax_rate <= events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    case 'low_morale':
                        if (global.city.morale.current >= events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    case 'biome':
                        // there are currently no events with the biome requirement
                        if (global.city.biome !== events[event].reqs[req]){
                            isOk = false;
                        }
                        break;
                    default:
                        isOk = false;
                        break;
                }
            });
        }
        if (isOk && events[event]['condition'] && !events[event].condition()){
            isOk = false;
        }
        if (isOk){
            event_pool.push(event);
        }
    });
    return event_pool;
}

function tax_revolt(){
    let special_res = ['Soul_Gem', 'Corrupt_Gem', 'Codex', 'Demonic_Essence']
    let ramp = global.civic.govern.type === 'oligarchy' ? 45 : 25;
    let aristoVal = govActive('aristocrat',2);
    if (aristoVal){
        ramp -= aristoVal;
    }
    let risk = (global.civic.taxes.tax_rate - ramp) * 0.04;
    Object.keys(global.resource).forEach(function (res) {
        if (!special_res.includes(res)){
            let loss = Math.rand(1,Math.round(global.resource[res].amount * risk));
            let remain = global.resource[res].amount - loss;
            if (remain < 0){ remain = 0; }
            global.resource[res].amount = remain;
        }
    });
    return loc('event_tax_revolt');
}
