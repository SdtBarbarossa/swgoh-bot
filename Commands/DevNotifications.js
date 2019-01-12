const sql = require('mssql');
const pushmessage = require('../Commands/Pushmessage');

module.exports = async ( lineidNow, devNotification, groupId ) => {
	try {
		
		if(!lineidNow || lineidNow == ""){
			throw new Error('your lineId seems to be emtpy. To fix this add me as a friend.');
	} 
	
	let isGroupChannel = false;
	if(lineidNow == groupId){
		isGroupChannel = true;
	}
	
	await sql.connect('mssql://linebotdb:Wk99lNRnQ~_y@den1.mssql7.gear.host/linebotdb');
        const result = await sql.query`select * from lineidToAllycode where lineId = ${lineidNow}`;
	
	if(result.recordset.length == 0 && isGroupChannel == true)
	{
		pushmessage(groupId, "We could not find a allycode associated with this groupchat.");
	}
	else if(isGroupChannel == false){
		pushmessage(groupId, "This function is only available in groupchats.");	
	}
	else{
		
		const resultUpdate = await sql.query`update lineidToAllycode set devNotifications = ${devNotification} where lineId = ${lineidNow}`;
		
		if(devNotification == true){
		pushmessage(groupId, "devNotification turned on");			
		}
		else{
		pushmessage(groupId, "devNotification turned of");
		}
	}
	sql.close();
	} catch(e) {
  		console.log(e.message);
		sql.close();
		pushmessage(groupId, e.message);
	}

}
