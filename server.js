'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
let guild = null;
require('x-date');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

const allycode = process.env.GUILD_ALLYCODE;

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    var message = "";

    if(event.message.text.toLowerCase() == "hello there" || event.message.text.toLowerCase() == "hello there!") {
        message = "General Kenobi!";
    }
    
    if (event.message.text.startsWith("#")) {
        var words = event.message.text.split(" ");
        var eventWithoutStart = words[0].replace("#", "");

        switch (eventWithoutStart.toLowerCase()) {
            case "events":
                try {
                    message = await getEvents();
                    if (message == "") {
                        message = "keine events gefunden";
                    }
                }
                catch (err) {
                    message = "konnte die eventdaten nicht lesen";
                }
                break;
            case "raub":
                try {
                    message = await getRaub();
                    if (message == "") {
                        message = "keinen Raub gefunden";
                    }
                }
                catch (err) {
                    message = "konnte die eventdaten nicht lesen";
                }
                break;
            case "regeln":
                message = "Dies sind die Regeln des Schattenkollektives:"
                + "\r\n- Wenn man am Territorialkrieg angemeldet ist muss man sich beteiligen"
                + "\r\n- In den Territorialschlachten ist das 3fache der eigenen GM einzusetzen"
                + "\r\n- In den TB und TW ist den Befehlen der Offizieren stets folge zu leisten"
                + "\r\n- Nach 7 Tagen inaktivitaet ohne vorherige abmeldung wird man der Gilde entfernt"
                + "\r\n- 2100 Raidtickets pro Woche sind zu erbringen"
                + "\r\n- Man muss ueber Line erreichbar sein. Wenn man nicht selbst in Line ist dann muss man zumindest ueber eine dritte Perosn die ueber Line verfuegt erreichbar sein"
                + "\r\n- Rancor Startzeit: 19:30"
                + "\r\n- Haat Startzeit: 20:00"
                + "\r\n- Sithraid: wann immer moeglich";
                break;
            case "twlineup":
                message = "TW-Lineup: "
                + "\r\nO1 - min 95K"
                + "\r\nO2 - max 60k"
                + "\r\nO3 - max 200k (Flotte)"
                + "\r\nO4 - max 100k (Flotte)"
                + "\r\nU1 - 65k-75k"
                + "\r\nU2 - 80k-95k"
                + "\r\nU3 - 65k-75k"
                + "\r\nU4 - max 65k"
                + "\r\nM1 - 65k-75k"
                + "\r\nM2 - max 65k";
                break;
            case "allycode":
		let updatedGuild = await updateGuild();
			
			if(!guild){
				return sendMessage(updatedGuild, event.replyToken);
			}
			
                if(words.length > 1)
                {
			try{
		let foundAllyCode = await getMemberAllycodeByName(words[1]);
                message = words[1] + " allycode is: " + foundAllyCode;
			}catch(err){
			message = "kein Mitglied mit dem Namen " + words[1] + " gefunden";	
			}
                }
                else
                {
                    message = "bitte geben sie einen Membernamen mit an ( z.B. : #allycode sdtbarbarossa )";
                }
            break;
            case "zeta":
		let updatedGuilda = await updateGuild();
			
			if(!guild){
				return sendMessage(updatedGuilda, event.replyToken);
			}
			
                if(words.length > 1)
                {
			try{
		let foundAllyCode = await getMemberAllycodeByName(words[1]);
		var payload = {
		"allycode" : foundAllyCode,
		"language": "ENG_US"
    		};
    		let player = (await swapi.fetchPlayer(payload))[0];
		message = await getZeta(player);
				
			}
		catch(err){
				message = err.message;
			}
		}
                else
                {
                    message = "bitte geben sie einen Membernamen mit an ( z.B. : #zeta sdtbarbarossa )";
                }
		
            break;
		case "help":
			message = "Verfügbare kommandos: "
			 	+ "\r\n #events"
			 	+ "\r\n #raub"
			 	+ "\r\n #regeln"
			 	+ "\r\n #twlineup"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #zeta membername"
			 	+ "\r\n #help";
			break;
	default:
			message = "Verfügbare kommandos: "
			 	+ "\r\n #events"
			 	+ "\r\n #raub"
			 	+ "\r\n #regeln"
			 	+ "\r\n #twlineup"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #zeta membername"
			 	+ "\r\n #help";
        }
    }

    if (message == "") {
        return;
    }

    return sendMessage(message, event.replyToken);
}

async function getZeta(player){
	
	var message = "";
	
	try{
		/** Get the zeta recommendations from swapi cacher */
		let recommendations = await swapi.fetchZetas();
		
		let today = new Date();
		
		let lim = 10;
		message += `${player.name} - Next ${lim} best Zetas`;
		message += '\n`------------------------------`\n';
		
		
	    let availableZetas = [];
		
        for( let z of recommendations.zetas ) {
		
		console.log('z.name', z.name);
		
            let skill = player.roster.map(u => {
                let ss = u.skills.filter(s => s.name === z.name);
		    
		console.log('ss.length', ss.length);
                if( ss.length === 0 ) { return null; }
                
                ss[0].rarity = u.rarity;
                ss[0].level = u.level;
                ss[0].gear = u.gear;
                
                return ss.length > 0 ? ss[0] : null;
            });
            skill = skill.filter(s => s);
            
            if( !skill || !skill[0] || skill[0].tier === 8 ) { continue; }
            
            z.rarity = skill[0].rarity;
            z.gear = skill[0].gear;
            availableZetas.push(z);
        }
        
		
	console.log('availableZetas', availableZetas.length);
		
        availableZetas.sort((a,b) => {
            return scoreZeta(a, player.roster) - scoreZeta(b, player.roster);
        });
        
	console.log('availableZetas', availableZetas.length);
        
        for( let az of availableZetas ) {
		console.log('az.name', az.name);
            if( lim === 0 ) { break; }
            
            message += '\n**'+az.toon+'** : '+az.name+'\n';
            
            --lim;
        }
        
		message += '`------------------------------`\n';			
				
			}catch(err){
			message = err.message;	
			}

	return message;
}

async function getEvents() {

    var payload = {
        "language": "GER_DE"
    };
    let events = await swapi.fetchEvents(payload);
    console.log(events);

    var message = "";
    console.log("length ist:");
    console.log(events.events.length);
    for (var i = 0; i < events.events.length; i++) {
        var date = new Date(events.events[i].instanceList[0].startTime);
        if (!events.events[i].id.includes('shipevent_') && !events.events[i].id.includes('restrictedmodbattle_') && !events.events[i].id.includes('challenge_') )
            message = message + "Event: " + events.events[i].nameKey.replace(/\[\/?[^\]]*\]/g, '').replace("\\n", " ") + " Start: " + date.format("dd.mm.yyyy HH:MM") + "UTC\n\r\n\r";
    }
    
    return message;

}

async function getRaub() {

    var payload = {
        "language": "GER_DE"
    };
    let events = await swapi.fetchEvents(payload);
    console.log(events);

    var message = "";
    console.log("length ist:");
    console.log(events.events.length);
    for (var i = 0; i < events.events.length; i++) {
        var date = new Date(events.events[i].instanceList[0].startTime);
        if (events.events[i].id == 'EVENT_TRAINING_DROID_SMUGGLING' || events.events[i].id == 'EVENT_CREDIT_HEIST_GETAWAY_V2' || events.events[i].id == 'EVENT_RESOURCE_SMUGGLERS_RUN' || events.events[i].id == 'EVENT_RESOURCE_CONTRABAND_CARGO')
            message = message + "Event: " + events.events[i].nameKey.replace(/\[\/?[^\]]*\]/g, '').replace("\\n", " ") + " Start: " + date.format("dd.mm.yyyy HH:MM") + "UTC\n\r\n\r";
    }

    return message;

}

async function updateGuild()
{
	console.log("Fetiching guild with allycode " + allycode);
	var payload = {
	"allycode" : allycode,
        "language": "GER_DE"
    };
    let guildNew = await swapi.fetchGuild(payload);
	
	if( !guildNew ) { 
	        let error = "I could not find a guild for this allycode. Please check your settings";
	        return error;
    	}
	
	guild = guildNew[0];
	
	return "guild updated sucessfully";
}

async function getMemberAllycodeByName(membername) {
    
    if( !guild ) { 
	        let error = "I could not find a guild for this allycode. Please check your settings";
	        return error;
    }
    
    let memberNow = guild.roster.find(function(mem) {
            return mem.name.toLowerCase() == membername.toLowerCase();
        	}
	);
    
    var message = memberNow.allyCode;

    return message;

}

function sendMessage(message, token) {

    // create a echoing text message
    const echo = { type: 'text', text: message };

    // use reply API
    return client.replyMessage(token, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

function scoreZeta( zeta, roster ) {
    let rankedScore = zeta.pvp * zeta.tw * zeta.tb * zeta.pit * zeta.tank * zeta.sith;
    if( rankedScore === 0 ) { rankedScore = 999 }
    
    let rosterScore = scoreRoster( zeta, roster );
    return rankedScore - rosterScore;
}

function scoreRoster( zeta, roster ) {
    // To-do : build a roster score based on squad support for zeta
    return (zeta.gear * zeta.rarity);
}
