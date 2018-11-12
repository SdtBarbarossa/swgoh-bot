const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, allycode, groupId ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		
	let allycodeAsNumber = Number(allycode);
	if(result.recordset.length == 0 )
	{
		const resultAdd = await sql.query`insert into lineidToAllycode(lineId, allycode) Values(${lineidNow},${allycodeAsNumber})`;
		pushmessage(groupId, "added you to with allycode " + allycode);
	}
	else{
		const resultUpdate = await sql.query`update lineidToAllycode set allycode = ${allycodeAsNumber} where lineId = ${lineidNow}`;
		pushmessage(groupId, "Updated your allycode to " + allycode);
	}
	sql.close();
	} catch(e) {
  		console.log(e.message);
		sql.close();
		pushmessage(groupId, e.message);
	}

}
