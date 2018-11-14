const pushmessage = require('../Commands/Pushmessage');
const https = require('https');

module.exports = async ( groupId, charaktername ) => {
	try {
    let message = "";
    
    const modRecommendationUrl = "https://apps.crouchingrancor.com/mods/advisor.json";

    https.get(modRecommendationUrl, (resp) => {
    let data = '';
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
    data += chunk;
    });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
  let modrecommendation = JSON.parse(data).data;
  let charFullName = modrecommendation.find( char => char.name == charaktername );
  let charShortName = modrecommendation.find( char => char.short == charaktername );
  
  let charNow = null;
  
  if(charFullName){
  charNow = charFullName;
  }else{
  charNow = charShortName;  
  }
  
  message += "Name : " + charNow.name + "\n";
  message += "----------------------\n";
  message += "set1 : " + charNow.set1 + "\n";
  message += "set2 : " + charNow.set2 + "\n";
  message += "set3 : " + charNow.set3 + "\n";
  message += "----------------------\n";
  message += "square : " + charNow.square + "\n";
  message += "arrow : " + charNow.arrow + "\n";
  message += "diamond : " + charNow.diamond + "\n";
  message += "triangle : " + charNow.triangle + "\n";
  message += "circle : " + charNow.circle + "\n";
  message += "cross : " + charNow.cross;
  
		pushmessage(groupId, message);
  });

}).on("error", (err) => {
		pushmessage(groupId, err.message);
});
    
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}
