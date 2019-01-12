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
		
    console.log('events', events);
		
 events = events.result;
    console.log('events', events);
    
    events.events.sort(function(a, b) {
    return a.instanceList[0].startTime - b.instanceList[0].startTime;
    });
		
    for (var i = 0; i < events.events.length; i++) {
        var date = new Date(events.events[i].instanceList[0].startTime);
        if (events.events[i].id == 'EVENT_TRAINING_DROID_SMUGGLING' || events.events[i].id == 'EVENT_CREDIT_HEIST_GETAWAY_V2' || events.events[i].id == 'EVENT_RESOURCE_SMUGGLERS_RUN' || events.events[i].id == 'EVENT_RESOURCE_CONTRABAND_CARGO')
            message = message + "Event: " + events.events[i].nameKey.replace(/\[\/?[^\]]*\]/g, '').replace("\\n", " ") + " Start: " + date.format("dd.mm.yyyy HH:MM") + "UTC\n\n";
    }
    
		pushmessage(groupId, message);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}
