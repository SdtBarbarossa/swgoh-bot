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
    
		//console.log('recommendations[sith].phase[0]',recommendations[criteria].phase[phaseAsNumber]);
		
		message += recommendations[criteria].phase[phaseAsNumber].name + "\n\n";
		
		let squadsForPhase = recommendations[criteria].phase[phaseAsNumber].squads;
		
		for(var i = 0; i < squadsForPhase.length;i++){
			console.log('squadsForPhase[i]', squadsForPhase[i]);
			message += squadsForPhase[i].name + "\n";
			message += squadsForPhase[i].note + "\n";
			for(var a = 0; a < squadsForPhase[i].team.length;a++){
				if(squadsForPhase[i].team[a].indexOf(':') !== -1)
				{
					message += squadsForPhase[i].team[a].substring(0, squadsForPhase[i].team[a].indexOf(':')) + ",";
				}
				else
				{
					message += squadsForPhase[i].team[a] + ",";
				}
			    }
			message += "\n\n";
		}
		
		message += `Recommendation keys: \n${Object.keys(recommendations).join(',')}`;
				
			}catch(err){
			message = err.message;	
			}
      return message;
}
