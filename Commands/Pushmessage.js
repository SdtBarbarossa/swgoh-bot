
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
		
if(message.length > 1900){
	console.log("The Message is very long. Look at this: " + message.length);
	var splitMessages = splitNChars(message, 1000);
	
	splitMessages.forEach(function(element)
			      {
	let plmessage = {
  		type: 'text',
  		text: element
		};
		
	client.pushMessage(destinationId, plmessage);
	});
	
	return;
}
	
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

function splitNChars(txt, num) {
  var result = [];
  for (var i = 0; i < txt.length; i += num) {
    result.push(txt.substr(i, num));
  }
  return result;
}
