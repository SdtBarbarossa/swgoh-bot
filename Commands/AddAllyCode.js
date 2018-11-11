const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
	
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		sql.close();
	
	if(result.recordset.length == 0)
	{
		console.log(result);
		
	pushmessage(lineidNow, "didnt found you in db");
	}
		else{
			console.log("anfrage ok: " + result.recordset.length );	
        console.log(result.output);
		
	pushmessage(lineidNow, result.output);
		}
		
		
		
	

		
	} catch(e) {
  console.log(e.message);
		sql.close();
		
	pushmessage(lineidNow, e.message);
	}

}
