const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId ) => {
	try {
		let answer = await getSquadRecommendations('sith', '1');
  pushmessage(groupId, answer);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}

async function getSquadRecommendations(criteria, phase){
	
	var message = "";
		
	try{
		let phaseAsNumber = Number(phase)-1;
		let recommendations = await swapi.fetchSquads({});
    
		console.log('recommendations[sith].phase[0]',recommendations[criteria].phase[phaseAsNumber]);
		
		message += recommendations[criteria].phase[phaseAsNumber].name + "\n";
		
		let squadsForPhase = recommendations[criteria].phase[phaseAsNumber].squads;
		
		for(let s in squadsForPhase){
			message += s.name + "\n";
			message += s.note + "\n";
			for(let t in s.team){
				message += t + "\n";
			    }
		}
		
		message += `Recommendation keys: \n${Object.keys(recommendations).join('\n')}\n`;
				
			}catch(err){
			message = err.message;	
			}
      return message;
}
