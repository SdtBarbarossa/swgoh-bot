'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
require('x-date');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

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

    var random = Math.floor((Math.random() * 100) + 1);
    
    if(random >  68)
    message = "General Grievous";
    
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
                message = "Dies sind die Regeln des Schattenkollektives: \n\r- Wenn man am Territorialkrieg angemeldet ist muss man sich beteiligen \n\r- In den Territorialschlachten ist das 3fache der eigenen GM einzusetzen \n\r- In den TB und TW ist den Befehlen der Offizieren stets folge zu leisten \n\r- Nach 7 Tagen inaktivitaet ohne vorherige abmeldung wird man der Gilde entfernt \n\r- 2100 Raidtickets pro Woche sind zu erbringen \n\r- Man muss ueber Line erreichbar sein. Wenn man nicht selbst in Line ist dann muss man zumindest ueber eine dritte Perosn die ueber Line verfuegt erreichbar sein \n\r- Rancor Startzeit: 19:30 \n\r- Haat Startzeit: 20:00 \n\r- Sithraid: wann immer moeglich";
                break;
            case "twlineup":
                message = "TW-Lineup: \n\rO1 - min 95K \n\rO2 - min 60k \n\rO3 - max 200k \n\rO4 - max 100k";
                break;
        }
    }

    if (message == "") {
        return;
    }

    return sendMessage(message, event.replyToken);
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
