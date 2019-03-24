'use strict';


const bodyParser = require('body-parser');
const PushmessageLine = require('./Commands/Pushmessage');

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
const rssChannelId = process.env.RSS_CCHANNEL_ID;

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

// create application/json parser
const jsonParser = bodyParser.json()

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
	req.connection.setTimeout(1000*60*60*5);
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// this is for echobase
app.post('/echobase', jsonParser, function(req,res) {
	
    	console.log('Webhook recieved!');
	res.send({status: 200});
	
	console.log("req.body", req.body);
	var discordMessage = req.body;
	
	var lineMessage = "";
	lineMessage += discordMessage.content.replace("*", " ");
    	console.log('lineMessage', lineMessage);	
	//PushmessageLine(rssChannelId, lineMessage);
});

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    var message = "";

	console.log(event);
	
    if(event.message.text.toLowerCase() == "hello there" || event.message.text.toLowerCase() == "hello there!") {
        message = "General Kenobi!";
    }
	
   let ran = getRandomInt(100);
	
  if(ran && ran >95 && event.source.groupId == rssChannelId){
	  const grivious = require('./Commands/GG');
	  grivious(event.source.groupId);
  }
	
    if(event.source.userId == 'U772f8750bbd469cb25d2a2b64925d78f' && !event.source.groupId)
       {
	client.pushMessage(rssChannelId, event.message)
  	.then(() => {
    	console.log('pushed');
  	})
  	.catch((err) => {
	console.log(err.message);
  	});
       }
    
    if (event.message.text.startsWith("#")) {
        var words = event.message.text.split(" ");
        var eventWithoutStart = words[0].replace("#", "");

	try{
	
	message = "🤔";
		
        switch (eventWithoutStart.toLowerCase()) {
            case "events":
                try {
		    const GetEvents = require('./Commands/GetEvents');
                    GetEvents(event.source.groupId);
                }
                catch (err) {
                    message = err.message;
                }
                break;
            case "heist":
                try {
		    const GetHeists = require('./Commands/GetHeists');
                    GetHeists(event.source.groupId);
                }
                catch (err) {
                    message = err.message;
                }
                break;
            case "spunkte":
                try {
		    const spunkte = require('./Commands/Spunkte');
		    let allycode = spunkte(event.source.userId , event.source.groupId);
                }
                catch (err) {
                    message = err.message;
                }
                break;
            case "spunkteall":
                try {
		    if(event.source.userId == 'U772f8750bbd469cb25d2a2b64925d78f' || event.source.userId == 'U9a88ae364b5103fd0cec37efdb54f9e0' || event.source.userId == 'Ufeaa0ff6b92c16dd947bc4b3e8718600' || event.source.userId == 'U16a21d48a86c6b19d02b66debca3011d')
		    {
		    const spunkteAll = require('./Commands/spunkteAll');
		    let allycode = spunkteAll(event.source.userId , event.source.groupId);
		    }
		else{
			message = "Diese Funktion steht dir leider nicht zur verfügung.";
		}
                }
                catch (err) {
                    message = err.message;
                }
                break;
		case "addme":
			try{
			let messageWithoutCommando = event.message.text.replace("#addme ","");
			const addMe = require('./Commands/AddAllyCode');
			let allycode = addMe(event.source.userId , messageWithoutCommando, event.source.groupId );
			}
			catch(err){
			message = err.message;
			};
		break;
		case "addguild":
			try{
			let messageWithoutCommando = event.message.text.replace("#addguild ","");
			const configData = require('./Commands/AddAllyCode');
			let allycode = configData(event.source.groupId , messageWithoutCommando, event.source.groupId );
			}
			catch(err){
			message = err.message;
			};
		break;
		case "activatedevnotifications":
			try{
			const configData = require('./Commands/DevNotifications');
			let allycode = configData(event.source.groupId , true, event.source.groupId );
			}
			catch(err){
			message = err.message;
			};
		break;
		case "deactivatedevnotifications":
			try{
			const configData = require('./Commands/DevNotifications');
			let allycode = configData(event.source.groupId , false, event.source.groupId );
			}
			catch(err){
			message = err.message;
			};
		break;
		case "mods":
			try{
			let messageWithoutCommando = event.message.text.replace("#mods ","");
			const ModRecommendation = require('./Commands/ModRecommendation');
			ModRecommendation(event.source.groupId , messageWithoutCommando );
			}
			catch(err){
			message = err.message;
			};
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
                if(words.length > 1)
                {
			try{
		const GetAllyCodeFromGuild = require('./Commands/GetAllyCodeFromGuild');
		GetAllyCodeFromGuild(event.source.groupId , event.message.text.replace("#allycode ","") );
			}catch(err){
			message = err.message;	
			}
                }
                else
                {
                    message = "please input the membername you search ( z.B. : #allycode sdtbarbarossa )";
                }
            break;
	    case "guild":
			
                if(words.length > 1)
                {
			try{
		let messageWithoutCommando = event.message.text.replace("#guild ","");
		let allycodeNow = null;
		let charList = [];
		const GetGuildOverview = require('./Commands/GetGuildOverview');
		if(messageWithoutCommando.indexOf("#") > 0)
		{
			allycodeNow = messageWithoutCommando.substr(0, (messageWithoutCommando.indexOf("#")-1));
			console.log('allycodeNow', allycodeNow);
			let charListNow = messageWithoutCommando.substr(messageWithoutCommando.indexOf("#")+1, (messageWithoutCommando.length-(messageWithoutCommando.indexOf("#")+1)));
			console.log('charListNow', charListNow);
			GetGuildOverview(event.source.groupId, allycodeNow, charListNow.split(","));
		}
				else{
				GetGuildOverview(event.source.groupId, messageWithoutCommando, charList);
				}
				
			}
		catch(err){
				message = err.message;
			}
		}
                else
                {
                    message = "please give me the allycode of a guildmember ( z.B. : #guild 123456789 )";
                }
		
            break;
	    case "character":
			
                if(words.length > 1)
                {
			try{
		let messageWithoutCommando = event.message.text.replace("#character ","");
		let allycodeNow = null;
		let charList = [];
		const GetCharFromGuild = require('./Commands/GetCharFromGuild');

		console.log('allycodeNow', allycodeNow);
		let charListNow = messageWithoutCommando;
		console.log('charListNow', charListNow);
		GetCharFromGuild(event.source.groupId, charListNow.split(","));

			}
		catch(err){
				message = err.message;
			}
		}
                else
                {
                    message = "please give me the allycode of a guildmember ( z.B. : #guild 123456789 )";
                }
		
            break;			
            case "zeta":
			try{
		let messageWithoutCommando = event.message.text.replace("#zeta ","");
		//to-do
		let criteria = "";
        	criteria = ["pvp", "tw", "tb", "pit", "tank", "sith"].includes(messageWithoutCommando) ? messageWithoutCommando : 'sith';
		
		const zeta = require('./Commands/Zeta');
		let allycode = zeta(event.source.userId , event.source.groupId, criteria );
				
			}
		catch(err){
				message = err.message;
			}		
            break;			
            case "squads":
			try{
		let messageWithoutCommando = event.message.text.replace("#squads ","");
		
		if(messageWithoutCommando.length == 0){
		   message = "please give me a criteria. for e.g. #squads sith 1";
		   }
		else{
		const SquadRecommendation = require('./Commands/SquadRecommendation');
		let criterias = messageWithoutCommando.split(" ");
		SquadRecommendation( event.source.groupId, criterias[0], criterias[1]);
		}
			}
		catch(err){
				message = err.message;
			}		
            break;			
            case "lstb":
			try{
		let messageWithoutCommando = event.message.text.replace("#lstb ","");
		
		if(messageWithoutCommando.length == 0){
		   message = "please give me a criteria. for e.g. #squads sith 1";
		   }
		else{
		const tb = require('./Commands/TB');
		tb(event.source.userId , event.source.groupId, messageWithoutCommando, true);
		}
			}
		catch(err){
				message = err.message;
			}		
            break;			
            case "dstb":
			try{
		let messageWithoutCommando = event.message.text.replace("#dstb ","");
		
		if(messageWithoutCommando.length == 0){
		   message = "please give me a criteria. for e.g. #squads sith 1";
		   }
		else{
		const tb = require('./Commands/TB');
		tb(event.source.userId , event.source.groupId, messageWithoutCommando, false);
		}
			}
		catch(err){
				message = err.message;
			}		
            break;
		case "help":
			message = "Available commands: "
			 	+ "\r\n #events"
			 	+ "\r\n #heist"
			 	+ "\r\n #addme {allycode}"
			 	+ "\r\n #addguild {allycode}"
			 	+ "\r\n #activateDevNotifications"
			 	+ "\r\n #deactivateDevNotifications"
			 	+ "\r\n #zeta {criteria}"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #guild {allycode} #{chracter}"
			 	+ "\r\n #character {character}"
			 	+ "\r\n #squads {raid} {phase}"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #help";
			break;
	default:
			
			message = "Available commands: "
			 	+ "\r\n #events"
			 	+ "\r\n #heist"
			 	+ "\r\n #addme {allycode}"
			 	+ "\r\n #addguild {allycode}"
			 	+ "\r\n #activateDevNotifications"
			 	+ "\r\n #deactivateDevNotifications"
			 	+ "\r\n #zeta {criteria}"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #guild {allycode} #{chracter}"
			 	+ "\r\n #character {character}"
			 	+ "\r\n #squads {raid} {phase}"
			 	+ "\r\n #allycode membername"
			 	+ "\r\n #help";
        }
		
		
			    }
                catch (err) {
                    message = "Error: " + err.message;
                }
		
    }
	
    if (message == "") {
        return;
    }

    return sendMessage(message, event.replyToken);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
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
