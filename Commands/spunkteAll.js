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

const SPREADSHEET_ID = '1b3zv_jMmec8AjHFHulWLz3iOvc-UW_EYLFchZwfJFzI';

module.exports = async ( lineidNow, groupId) => {
	try {

		googleAuth.authorize()
    .then((auth) => {
        sheetsApi.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: SPREADSHEET_ID,
            range: "'Sheet1'!A1:Q60",
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
        	pushmessage(groupId, 'The API returned an error:' + err);
                return console.log(err);
            }
            var rows = response.data.values;
		
		var messageToSend = "Zusammenfassung: \n";
		
		rows.forEach(function(element) {
		if(element[0] != "Name"){
		var messageToSendTemp = "-----------\nSpieler: " + element[0] + "\n";
		var keinVergehen = true;
		for( var i = 1; i < 13; i=i+3 ){			
		if(element[i] != ""){
		messageToSendTemp += "Datum: " + element[i] + " Punkte: " + element[i+1] + " Vergehen : " + element[i+2] + "\n";
		keinVergehen = false;
		}
		}
			
		if(keinVergehen != true){	
			messageToSend += messageToSendTemp;
		}	
		}
		});
		
    	    pushmessage(lineidNow, messageToSend);
    	    pushmessage(groupId, "Ich habe dir privat geantwortet.");
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
