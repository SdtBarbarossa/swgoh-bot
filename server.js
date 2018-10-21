'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

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
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    var message = "";

    if (event.message.text.startsWith("#")) {
        var words = event.message.text.split(" ");
        var eventWithoutStart = words[0].replace("#", "");

        switch (eventWithoutStart.toLowerCase()) {
            case "events":
                try {
                    var payload = {
                        "language": "eng_us"
                    };
                    getEvents(event.replyToken);
                }
                catch (err) {
                    message = "konnte die eventdaten nicht lesen";
                }
                break;
            case "raub":
                message = "midi test raub";
                break;
            case "regeln":
                message = "Dies sind die Regeln des Schattenkollektives: \n\r- Wenn man am Territorialkrieg angemeldet ist muss man sich beteiligen \n\r- In den Territorialschlachten ist das 3fache der eigenen GM einzusetzen \n\r- Nach 7 Tagen inaktivitaet ohne vorherige abmeldung wird man der Gilde entfernt \n\r- 2100 Raidtickets pro Woche sind zu erbringen \n\r- Man muss ueber Line erreichbar sein. Wenn man nicht selbst in Line ist dann muss man zumindest ueber eine dritte Perosn die ueber Line verfuegt erreichbar sein \n\r- Rancor Startzeit: 19:30 \n\r- Haat Startzeit: 20:00 \n\r- Sithraid: wann immer moeglich";
                break;
        }
    }

    if (message == "") {
        return;
    }

    return sendMessage(message, event.replyToken);
}

async function getEvents(token) {

    var payload = {
        "language": "eng_us"
    };
    let events = await swapi.fetchEvents(payload);
    console.log(events);

    var message = "";
    console.log("length ist:");
    console.log(events.events.length);
    for (var i = 0; i < events.events.length; i++) {
        message = message + "\n\rEvent: " + events.events[i].nameKey + " Start: " + new Date(events.events[i].instanceList[0].startTime);

        console.log(i);
    }

    console.log("out of loop");

    // create a echoing text message
    const echo = { type: 'text', text: message };

    // use reply API
    return client.replyMessage(token, echo);

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