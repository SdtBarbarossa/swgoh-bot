const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId, charList) => {
	try {
  let message = "";
  
  let allyCodeNow = await getAllyCode( groupId, groupId );
  message = await findCharacter(allyCodeNow, charList);
  
  pushmessage(groupId, message);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}

async function findCharacter(allycodeNow, charListNow){
	
	let message = "";
	
	try {
		
		/** Get player from swapi cacher */
	console.log("Fetiching guild with allycode " + allycodeNow);
	var payload = {
	"allycode" : allycodeNow,
        "language": "ENG_US"
    	};
    	let guildNowFull = await swapi.fetchGuild(payload);
    	let guildNow = guildNowFull[0];

		if( !guildNow ) {
		    return 'I could not find a guild.\nMake sure the user is registered, or the allycode used is guild affiliated.';
		}
		
	console.log("found guild with name " + guildNow.name);
		
		let today = new Date();
        
	//ROSTER CALC

    let charList = [];
		for(let char of charListNow){
			charList.push(char);
		}  
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let allycodes = guildNow.roster.map(p => p.allyCode);
	console.log('allycodes', allycodes);
        
	let units = null;
        try {
	var payloadUnits = {
	"allycode" : allycodes,
        "language": "ENG_US"
    	};
            units = await swapi.fetchUnits(payloadUnits);
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

            message += value;

        }
       
	//ROSTER CALC END
		
	return message;

	} catch(e) {
            return e.message;
	}

}
