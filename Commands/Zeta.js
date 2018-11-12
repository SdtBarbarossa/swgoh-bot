const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

module.exports = async ( lineidNow, groupId ) => {
	try {
  let allyCodeNow = await GetAllyCode( lineidNow, groupId );
  pushmessage(groupId, "Your allycode is : " + allyCodeNow);
	} catch(e) {
  		console.log(e.message);
		sql.close();
		pushmessage(groupId, e.message);
	}

}
