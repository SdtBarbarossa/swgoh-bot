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

    var message = event.message.text;

    if (event.message.text.startsWith("#")) {
        var words = event.message.text.split(" ");
        var eventWithoutStart = words[0].replace("#", "");

        switch (eventWithoutStart.toLowerCase()) {
            case "events":
                try {
                    var payloud = {
                        "language": "eng_us"
                    };
                    const events = swapi.fetchEvents(payloud);
                    message = events;
                }
                catch (err) {
                    message = "konnte die eventdaten nicht lesen";
                }
                break;
            case "raub":
                message = "midi test raub";
                break;
        }
    }

    return sendMessage(message, event.replyToken);
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