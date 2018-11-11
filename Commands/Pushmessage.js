
const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

module.exports = async ( destinationId, message ) => {
	try {

let pmessage = {
  		type: 'text',
  		text: message
		};

client.pushMessage(destinationId, pmessage)
  .then(() => {
    console.log('pushed');
  })
  .catch((err) => {
	console.log(err.message);
  });

	} catch(e) {
  console.log(e.message);
	}
}
