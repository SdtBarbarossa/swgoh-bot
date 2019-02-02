const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( lineidNow, groupId, criteriaNow ) => {
	try {
  let allyCodeNow = await getAllyCode( lineidNow, groupId );
		
var payload = {
		"allycode" : allyCodeNow,
        	"language": "ENG_US"
    		};
let player = (await swapi.fetchPlayer(payload));
		player = player.result[0];
		
    pushmessage(groupId, "Player: " + player.name);
	} catch(e) {
  		console.log(e.message);
	}

}
