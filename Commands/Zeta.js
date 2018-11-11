const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineid ) => {
	try {
	
	pushmessage(lineid, "");
		
	} catch(e) {
  console.log(e.message);
	pushmessage(lineid, e.message);
	}

}
