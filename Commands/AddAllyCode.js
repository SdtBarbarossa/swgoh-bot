const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, allycode ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
	
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		
	let allycodeAsNumber = Number(allycode);
	if(result.recordset.length == 0 )
	{
		console.log(result);
		
		const resultAdd = await sql.query`insert into lineidToAllycode(lineId, allycode) Values(${lineidNow},${allycodeAsNumber})`;
		
	pushmessage(lineidNow, "added you to with allycode " + allycode);
	}
		else{
			
			if(result.recordset[0].allycode == null){
			const resultUpdate = await sql.query`update lineidToAllycode set allycode = ${allycodeAsNumber} where lineId = ${lineidNow})`;
		pushmessage(lineidNow, "Updated your allycode to " + allycode);
			}
			else{
			

		console.log(result.recordset);
	pushmessage(lineidNow, "I already added you with " + result.recordset[0].allycode);
			}
		}
		
		
		
	sql.close();

		
	} catch(e) {
  console.log(e.message);
		sql.close();
		
	pushmessage(lineidNow, e.message);
	}

}
