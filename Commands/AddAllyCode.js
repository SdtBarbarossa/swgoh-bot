const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, allycode ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
	
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		sql.close();
	
	if(result.recordset.length == 0)
	{
		console.log(result);
		const resultAdd = await sql.query`insert into lineidToAllycode(lineId, allycode) Values(${lineidNow},${allycode})`;
		
	pushmessage(lineidNow, "added you to with allycode " + allycode);
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
