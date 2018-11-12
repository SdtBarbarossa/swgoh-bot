const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, groupId ) => {
	try {
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
	sql.close();
	console.log('result.recordset', result.recordset);
	return result.recordset[0].allycode;
	} catch(e) {
  		console.log(e.message);
		sql.close();
		pushmessage(groupId, e.message);
	}

}
