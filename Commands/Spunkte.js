const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( groupId ) => {
	try {
    pushmessage(groupId, "test");
	} catch(e) {
  		console.log(e.message);
	}

}
