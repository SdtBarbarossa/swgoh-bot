const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, allycode ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
	
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		
	
	if(result.recordset.length == 0 || result.recordset[0].allycode == null)
	{
		console.log(result);
		let allycodeAsNumber = Number(allycode);
		const resultAdd = await sql.query`insert into lineidToAllycode(lineId, allycode) Values(${lineidNow},${allycodeAsNumber})`;
		
	pushmessage(lineidNow, "added you to with allycode " + allycode);
	}
		else{
				

		console.log(result.recordset);
	pushmessage(lineidNow, "I already added you with " + result.recordset[0].allycode);
		}
		
		
		
	sql.close();

		
	} catch(e) {
  console.log(e.message);
		sql.close();
		
	pushmessage(lineidNow, e.message);
	}

}
