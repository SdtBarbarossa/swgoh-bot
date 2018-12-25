const pushmessage = require('../Commands/Pushmessage');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( groupId ) => {
	try {
    let message = "";
    
    var payload = {
        "language": "ENG_US"
    };
    let events = await swapi.fetchEvents(payload);

events.result.events.sort(function(a, b) {
  return a.instanceList[0].startTime - b.instanceList[0].startTime;
});
		
    for (var i = 0; i < events.result.events.length; i++) {
        var date = new Date(events.result.events[i].instanceList[0].startTime);
        if (!events.result.events[i].id.includes('shipevent_') && !events.result.events[i].id.includes('restrictedmodbattle_') && !events.result.events[i].id.includes('challenge_') )
            message = message + "Event: " + events.result.events[i].nameKey.replace(/\[\/?[^\]]*\]/g, '').replace("\\n", " ") + "\nStart: " + date.format("dd.mm.yyyy HH:MM") + "UTC\n\n";
    }
    
		pushmessage(groupId, message);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}
