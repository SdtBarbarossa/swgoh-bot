const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineid ) => {
	try {
		await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb')
        let result = await sql.query`select * from lineidToAllycode where lineId = ${lineid}`
        console.log(result);
	pushmessage(lineid, result);
		
	} catch(e) {
  console.log(e.message);
	}

}
