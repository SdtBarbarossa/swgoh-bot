const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`
	
	if(result == "")
	{
	pushmessage(lineidNow, "didnt found you in db");
	}
	
        console.log(result);
	pushmessage(lineidNow, result);
		
	} catch(e) {
  console.log(e.message);
	pushmessage(lineidNow, e.message);
	}

}
