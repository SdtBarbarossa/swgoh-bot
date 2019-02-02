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
  let allyCodeNow = await getAllyCode( lineidNow, groupId );
		
var payload = {
		"allycode" : allyCodeNow,
        	"language": "ENG_US"
    		};
let player = (await swapi.fetchPlayer(payload));
		player = player.result[0];
		
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
            console.log('response', response);
            var rows = response.data.values;
            console.log(null, rows);
    	    pushmessage(groupId, "rows: " + rows);
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
