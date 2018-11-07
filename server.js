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
	req.connection.setTimeout(1000*60*60*5);
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

	try{
		
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
	     case "guildupdate":
                try {
			if(!guild || guild.updated < ( (+ new Date()) - (1000*60*60*24) ) ){
                    message = await updateGuild();
			}else{
			message = "Guild is up to date! " + guild.updated ;	
			}
                }
                catch (err) {
                    message = err.message;
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
		let foundAllyCode = await getMemberAllycodeByName(event.message.text.replace("#allycode ",""));
				console.log("foundAllyCode = " + foundAllyCode);
                message = event.message.text.replace("#allycode ","") + " allycode is: " + foundAllyCode;
			}catch(err){
			message = "kein Mitglied mit dem Namen " + event.message.text.replace("#allycode ","") + " gefunden. Error: " + err.message;	
			}
                }
                else
                {
                    message = "bitte geben sie einen Membernamen mit an ( z.B. : #allycode sdtbarbarossa )";
                }
            break;
		
	    case "guild":
			
                if(words.length > 1)
                {
			try{
		let messageWithoutCommando = event.message.text.replace("#guild ","");
		let allycodeNow = null;
		let charList = [];
		if(messageWithoutCommando.indexOf("#") > 0)
		{
			allycodeNow = messageWithoutCommando.substr(0, (messageWithoutCommando.indexOf("#")-1));
			console.log('allycodeNow', allycodeNow);
			let charListNow = messageWithoutCommando.substr(messageWithoutCommando.indexOf("#")+1, (messageWithoutCommando.length-(messageWithoutCommando.indexOf("#")+1)));
			console.log('charListNow', charListNow);
		message = await guildOverview(allycodeNow, charListNow.split(","));
		}
				else{
		message = await guildOverview(messageWithoutCommando, charList);
				}
				
			}
		catch(err){
				message = err.message;
			}
		}
                else
                {
                    message = "bitte geben sie einen Allycode mit an ( z.B. : #guild 123456789 )";
                }
		
            break;
			
			
			guildOverview(allycodeNow)
			
            case "zeta":
		let updatedGuilda = await updateGuild();
			
			if(!guild){
				return sendMessage(updatedGuilda, event.replyToken);
			}
			
                if(words.length > 1)
                {
			try{
		let messageWithoutCommando = event.message.text.replace("#zeta ","");
		let memberNameNow = "";
		let criteriaNow = "";
		if(messageWithoutCommando.indexOf("#") > 0)
		{
			memberNameNow = messageWithoutCommando.substr(0, (messageWithoutCommando.indexOf("#")-1));
			console.log('memberNameNow', memberNameNow);
			criteriaNow = messageWithoutCommando.substr(messageWithoutCommando.indexOf("#")+1, (messageWithoutCommando.length-(messageWithoutCommando.indexOf("#")+1)));
			console.log('criteriaNow', criteriaNow);
		}
		else{
			memberNameNow = messageWithoutCommando;		
		}
		let foundAllyCode = await getMemberAllycodeByName(memberNameNow);
		var payload = {
		"allycode" : foundAllyCode,
        	"language": "ENG_US"
    		};
    		let player = (await swapi.fetchPlayer(payload))[0];
		
		//to-do
		let criteria = "";
        	criteria = ["pvp", "tw", "tb", "pit", "tank", "sith"].includes(criteriaNow) ? criteriaNow : 'versa';
				
		console.log('criteria', criteria);
				
		message = await getZeta(player, criteria);
				
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
                catch (err) {
                    message = "Error: " + err.message;
                }
		
    }
	
    if (message == "") {
        return;
    }

    return sendMessage(message, event.replyToken);
}

async function getZeta(player, criteria){
	
	var message = "";
		
	try{
		var payload = {
        	"language": "ENG_US"
    		};
		
		/** Get the zeta recommendations from swapi cacher */
		let recommendations = await swapi.fetchAPI( swapi.zetas, payload );
		
		let today = new Date();
		
		let lim = 10;
		message += `${player.name} - Next ${lim} best Zetas`;
		message += criteria ? ' Filtered by : '+criteria+' \n' : '';
		message += '\n------------------------------\n';
		
		
	    let availableZetas = [];
		
        for( let z of recommendations.zetas ) {
				
            let skill = player.roster.map(u => {
				    
                let ss = u.skills.filter(s => s.nameKey === z.name);
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
        		
        if( criteria ) {
            availableZetas.sort((a,b) => {
                return scoreZeta(a[criteria], player.roster) - scoreZeta(b[criteria], player.roster) >= 0 ? 1 : -1;
            });
        } else {
            availableZetas.sort((a,b) => {
                return scoreZeta(a, player.roster) - scoreZeta(b, player.roster) >= 0 ? 1 : -1;
            });
        }  
                
        for( let az of availableZetas ) {
            if( lim === 0 ) { break; }
            
            message += ''+az.toon+' : '+az.name+'\n';
            
            --lim;
        }
        
		message += '------------------------------\n';
		message += 'Optional filter criteria :\n pvp, tw, tb, pit, tank, sith, versa\n';
				
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
	var now = new Date();
	var yesterday = now.setDate(now.getDate() - 1)
	if(!guild || guild.updated < (+ yesterday) ){
		
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
	
	}
	else{
	console.log("guild still up to date");	
	}
	
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
    if( typeof zeta === 'number' ) return parseInt(zeta);

    let rankedScore = zeta.pvp * zeta.tw * zeta.tb * zeta.pit * zeta.tank * zeta.sith;
    if( rankedScore === 0 ) { rankedScore = 999 }
    
    let rosterScore = scoreRoster( zeta, roster );
    return rankedScore - rosterScore;
}

function scoreRoster( zeta, roster ) {
    // To-do : build a roster score based on squad support for zeta
    return (zeta.gear * zeta.rarity);
}

//Diese Funktionen später auslagern

async function guildOverview(allycodeNow, charListNow){
	
	let message = "";
	
	try {
		
		/** Get player from swapi cacher */
	console.log("Fetiching guild with allycode " + allycodeNow);
	var payload = {
	"allycode" : allycodeNow,
        "language": "GER_DE"
    	};
    	let guildNowFull = await swapi.fetchGuild(payload);
    	let guildNow = guildNowFull[0];

		if( !guildNow ) {
		    return 'I could not find a guild.\nMake sure the user is registered, or the allycode used is guild affiliated.';
		}
		
	console.log("found guild with name " + guildNow.name);
		
		let today = new Date();
		
		message = `${guildNow.name}\n`;
		message += guildNow.desc ? guildNow.desc+'\n' : '';
		message += guildNow.message ? ''+guildNow.message+'\n' : '';
		message += '------------------------------\n';
		message += 'Members: '+guildNow.members+' / 50\n';
		message += guildNow.raid.rancor ? 'Rancor: '+guildNow.raid.rancor+'\n' : '';
		message += guildNow.raid.aat ? 'AAT: '+guildNow.raid.aat+'\n' : '';
		message += guildNow.raid.sith_raid ? 'Sith: '+guildNow.raid.sith_raid+'\n' : '';
		message += 'GP: '+guildNow.gp.toLocaleString()+'\n';
		message += '------------------------------\n';
        
	//ROSTER CALC

        let charList = ["BASTILASHAN", "ENFYSNEST", "DARTHTRAYA"];
		for(let char of charListNow){
			charList.push(char);
		}
        let shipList = ["HOUNDSTOOTH"];
               
        let coi = [];
        
        let arenas = [ 0, 0 ];
        let zetas = 0;
        
        let allycodes = guildNow.roster.map(p => p.allyCode);
	console.log('allycodes', allycodes);
        
	let units = null;
        try {
	var payloadUnits = {
	"allycode" : allycodes,
        "language": "GER_DE"
    	};
            units = await await swapi.fetchUnits(payloadUnits);
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
        let shipGP = unitIds.map(id => { 
            if( units[id][0].type === 'SHIP' || units[id][0].type === 2 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        shipGP = shipGP.filter(s => s);
        shipGP = shipGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        let charGP = unitIds.map(id => { 
            if( units[id][0].type === 'CHARACTER' || units[id][0].type === 1 ) {
                return units[id].reduce((total,num) => parseInt(parseInt(total || 0) + parseInt(num.gp || 0)),0);
            }
            return 0;
        });
        charGP = charGP.filter(c => c);
        charGP = charGP.reduce((total,num) => parseInt(parseInt(total) + parseInt(num)),0);
        
        message += 'Calculated GP: '+(parseInt(shipGP)+parseInt(charGP)).toLocaleString()+'\n';
        message += 'Calculated Char GP: '+charGP.toLocaleString()+'\n';
        message += 'Calculated Ship GP: '+shipGP.toLocaleString()+'\n';
	message += '------------------------------\n';
        
	console.log('Calculating GP ok');
		
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
            
            value += '------------------------------\n'

            message += value;

        }
        
        for( let s of shipList ) {
    
		    let u = units[s] || [];
		
		    if( u.length > 0 ) {
		        value = '' + s + '\n';
                value += '★★★★★★★: '+u.filter(t => t.starLevel === 7).length+'\n';
                value += '★★★★★★☆: '+u.filter(t => t.starLevel === 6).length+'\n';
                value += '★★★★★☆☆: '+u.filter(t => t.starLevel === 5).length+'\n';
            } else {
                value = 'None\n';
            }
            
            value += '------------------------------\n'

            message += value;

        }
       
	//ROSTER CALC END
		
	return message;

	} catch(e) {
            return e.message;
	}

}
