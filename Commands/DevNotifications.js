const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, allycode, groupId ) => {
	try {
		
		if(!lineidNow || lineidNow == ""){
			throw new Error('your lineId seems to be emtpy. To fix this add me as a friend.');
	} 
	
	let isGroupChannel = false;
	if(lineidNow == groupId){
		isGroupChannel = true;
	}
		
	let activateNotifications = false;
		
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
		
	let allycodeAsNumber = Number(allycode);
	if(result.recordset.length == 0 )
	{
		const resultAdd = await sql.query`insert into lineidToAllycode(lineId, allycode, isGroupChannel, devNotifications) Values(${lineidNow},${allycodeAsNumber}, ${isGroupChannel},${activateNotifications})`;
		pushmessage(groupId, "added you to with allycode " + allycode);
	}
	else{
		
		const resultUpdate = await sql.query`update lineidToAllycode set allycode = ${allycodeAsNumber}, isGroupChannel = ${isGroupChannel} where lineId = ${lineidNow}`;
		pushmessage(groupId, "Updated your allycode to " + allycode);
	}
	sql.close();
	} catch(e) {
  		console.log(e.message);
		sql.close();
		pushmessage(groupId, e.message);
	}

}
