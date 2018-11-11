const sql = require('mssql');

module.exports = async ( lineid ) => {
	try {
		await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb')
        const result = await sql.query`select * from lineidToAllycode where lindeId = ${lineid}`
        console.log(result);
        return result;
	} catch(e) {
  console.log(e.message);
  return e.message;
	}

}
