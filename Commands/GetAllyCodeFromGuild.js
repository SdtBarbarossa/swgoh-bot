const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId, membername ) => {
	try {
  let message = "";
  let allyCodeNow = await getAllyCode( groupId, groupId );

  console.log('allyCodeNow', allyCodeNow);
		
  var payload = {
	"allycode" : allyCodeNow,
  "language": "ENG_US"
   };
   
   let guildNew = await swapi.fetchGuild(payload);
   
   console.log('guildNew', guildNew);
   let guild = guildNew[0];
   console.log('guild', guild);
		
   let memberNow = guild.roster.find(function(mem) {
            return mem.name.toLowerCase() == membername.toLowerCase();
        	}
	);
    
  message += membername + " allycode is " + memberNow.allyCode;
  
	pushmessage(groupId, message);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}
