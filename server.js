'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'YnTmZ13cAk6+NRZX3d2liNemHiyd3MXnWpDdyXAGU/E0mwg1BOAxFkHFmvKAeJMgXVFQLIupWkluUeuV7Ra12kLBr0eSYNzgn3NMzq5qt1ZlqezbPjisY7EQDFMevMpugqRI5HZZpXuvmEUbBrVTjQdB04t89/1O/w1cDnyilFU=',
    channelSecret: process.env.CHANNEL_SECRET || '6880dcbfb8fb481c0ed3a0f7f89f738e',
};

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

    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});