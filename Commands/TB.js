const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

const {google} = require('googleapis');
const sheetsApi = google.sheets('v4');
const googleAuth = require('../Commands/auth');

const SPREADSHEET_ID_DS = '1czv7K2k7uPdnFS2wiTjMkmVmLPAxpcWK3NGrTPq3K7k';
const SPREADSHEET_ID_LS = '1zDUWLAY2COd1eoyrw9jlgiizF3IMk1Ay58ugq8vt-MY';

module.exports = async ( lineidNow, groupId, tbphase, lstb) => {
	try {
  
		googleAuth.authorize()
    .then((auth) => {
        sheetsApi.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: SPREADSHEET_ID,
            range: "'Sheet1'!A2:F56",
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
        	pushmessage(groupId, 'The API returned an error:' + err);
                return console.log(err);
            }
          var rows = response.data.values;
	
		      var messageToSend = "TB: " + "\n";
    
          rows.forEach
          (
          unit => 
            {  
              messageToSend += unit + "\n";
            }
          );
    
    	    pushmessage(lineidNow, messageToSend);
    	    pushmessage(groupId, "Ich habe dir Privat geantwortet.");
        });
    })
    .catch((err) => {
    pushmessage(groupId, "auth error: " + err);
        console.log('auth error', err);
    });
		
	} catch(e) {
    		pushmessage(e.message);
  		console.log(e.message);
	}

}
