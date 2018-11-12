const pushmessage = require('../Commands/Pushmessage');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId, allycode, charList ) => {
	try {
  let message = "";
  
  message = await guildOverview(allycode, charList);
  
  pushmessage(groupId, message);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}

async function guildOverview(allycodeNow, charListNow){
	
	let message = "";
	
	try {
		
		/** Get player from swapi cacher */
	console.log("Fetiching guild with allycode " + allycodeNow);
	var payload = {
	"allycode" : allycodeNow,
        "language": "GER_DE"
    	};
    	let guildNowFull = await swapi.fetchGuild(payload);
    	let guildNow = guildNowFull[0];

		if( !guildNow ) {
		    return 'I could not find a guild.\nMake sure the user is registered, or the allycode used is guild affiliated.';
		}
		
	console.log("found guild with name " + guildNow.name);
		
		let today = new Date();
		
		message = `${guildNow.name}\n`;
		message += guildNow.desc ? guildNow.desc+'\n' : '';
		message += guildNow.message ? ''+guildNow.message+'\n' : '';
		message += '------------------------------\n';
		message += 'Members: '+guildNow.members+' / 50\n';
		message += guildNow.raid.rancor ? 'Rancor: '+guildNow.raid.rancor+'\n' : '';
		message += guildNow.raid.aat ? 'AAT: '+guildNow.raid.aat+'\n' : '';
		message += guildNow.raid.sith_raid ? 'Sith: '+guildNow.raid.sith_raid+'\n' : '';
		message += 'GP: '+guildNow.gp.toLocaleString()+'\n';
		message += '------------------------------\n';
        
	//ROSTER CALC

        let charList = ["BASTILASHAN", "ENFYSNEST", "DARTHTRAYA"];
		for(let char of charListNow){
			charList.push(char);
		}
        let shipList = ["HOUNDSTOOTH"];
               
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let allycodes = guildNow.roster.map(p => p.allyCode);
	console.log('allycodes', allycodes);
        
	let units = null;
        try {
	var payloadUnits = {
	"allycode" : allycodes,
        "language": "GER_DE"
    	};
            units = await await swapi.fetchUnits(payloadUnits);
            if( !units ) {             
	            let error = new Error('Error fetching units from swgoh.help');
	            error.code = 400;
	            throw error;
            }
        } catch(e) {
            console.error(e);
            let error = new Error('Error fetching units from swgoh.help');
            error.code = 400;
            throw error;
        }
		
	console.log('units are not null');
         
        let unitIds = Object.keys(units);
        let shipGP = unitIds.map(id => { 
            if( units[id][0].type === 'SHIP' || units[id][0].type === 2 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        shipGP = shipGP.filter(s => s);
        shipGP = shipGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        let charGP = unitIds.map(id => { 
            if( units[id][0].type === 'CHARACTER' || units[id][0].type === 1 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        charGP = charGP.filter(c => c);
        charGP = charGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        message += 'Calculated GP: '+(parseInt(shipGP)+parseInt(charGP)).toLocaleString()+'\n';
        message += 'Calculated Char GP: '+charGP.toLocaleString()+'\n';
        message += 'Calculated Ship GP: '+shipGP.toLocaleString()+'\n';
	message += '------------------------------\n';
        
	console.log('Calculating GP ok');
		
        let value = null;
        
        for( let c of charList ) {
    
		    let u = units[c] || [];
		
		    if( u.length > 0 ) {
		        value = '' + c + '\n';
                value += '★★★★★★★: '+u.filter(t => t.starLevel === 7).length+'\n';
                value += '★★★★★★☆: '+u.filter(t => t.starLevel === 6).length+'\n';
                value += '★★★★★☆☆: '+u.filter(t => t.starLevel === 5).length+'\n';
                value += u.filter(t => t.zetas.length === 3).length > 0 ? 'Zeta ✦✦✦: '+u.filter(t => t.zetas.length === 3).length+'\n' : '';
                value += u.filter(t => t.zetas.length === 2).length > 0 ? 'Zeta ✦✦: '+u.filter(t => t.zetas.length === 2).length+'\n' : '';
                value += u.filter(t => t.zetas.length === 1).length > 0 ? 'Zeta ✦: '+u.filter(t => t.zetas.length === 1).length+'\n' : '';
                value += 'Gear XII+: '+u.filter(t => t.gearLevel === 12 && t.gear.length >= 3).length+'\n';
                value += 'Gear XII: '+u.filter(t => t.gearLevel === 12 && t.gear.length < 3).length+'\n';
                value += 'Gear XI: '+u.filter(t => t.gearLevel === 11).length+'\n';
                value += 'Gear X: '+u.filter(t => t.gearLevel === 10).length+'\n';
            } else {
                value = 'None\n';
            }
            
            value += '------------------------------\n'

            message += value;

        }
        
        for( let s of shipList ) {
    
		    let u = units[s] || [];
		
		    if( u.length > 0 ) {
		        value = '' + s + '\n';
                value += '★★★★★★★: '+u.filter(t => t.starLevel === 7).length+'\n';
                value += '★★★★★★☆: '+u.filter(t => t.starLevel === 6).length+'\n';
                value += '★★★★★☆☆: '+u.filter(t => t.starLevel === 5).length+'\n';
            } else {
                value = 'None\n';
            }
            
            value += '------------------------------\n'

            message += value;

        }
       
	//ROSTER CALC END
		
	return message;

	} catch(e) {
            return e.message;
	}

}
