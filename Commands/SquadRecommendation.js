const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId ) => {
	try {
		let answer = await getSquadRecommendations();
  pushmessage(groupId, answer);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}

async function getSquadRecommendations(){
	
	var message = "";
		
	try{
		let recommendations = await swapi.fetchSquads({});
    
		message += `Recommendation keys: ${Object.keys(recommendations).join('\n')}\n`;
				
			}catch(err){
			message = err.message;	
			}
      return message;
}
