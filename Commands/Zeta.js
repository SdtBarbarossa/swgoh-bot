const pushmessage = require('../Commands/Pushmessage');
const getAllyCode = require('../Commands/GetAllyCode');

const ApiSwgohHelp = require('api-swgoh-help');
const swapi = new ApiSwgohHelp({
    "username": process.env.API_USERNAME,
    "password": process.env.API_PASSWORD
});

module.exports = async ( lineidNow, groupId, criteriaNow ) => {
	try {
  let allyCodeNow = await getAllyCode( lineidNow, groupId );
		
var payload = {
		"allycode" : allyCodeNow,
        	"language": "ENG_US"
    		};
let player = (await swapi.fetchPlayer(payload));
		player = player.result[0];
		let answer = await getZeta(player, criteriaNow);
  pushmessage(groupId, answer);
	} catch(e) {
  		console.log(e.message);
		pushmessage(groupId, e.message);
	}

}

async function getZeta(player, criteria){
	
	var message = "";
		
	try{
		var payload = {
        	"language": "ENG_US"
    		};
		
		/** Get the zeta recommendations from swapi cacher */
		let recommendations = await swapi.fetchAPI( swapi.zetas, payload );
                const zetas = recommendations.result.zetas;
		recommendations = recommendations.result;
		
		let today = new Date();
		
		let lim = 10;
		message += `${player.name} - Next ${lim} best Zetas`;
		message += criteria ? ' Filtered by : '+criteria+' \n' : '';
		message += '\n------------------------------\n';
		
		
	    let availableZetas = [];
		
		let available = player.roster.reduce((acc,c) => {
                        //Basic unit ranking
                        let zs = c.skills.filter(s => s.isZeta && s.tier < 8)
                        zs.forEach( zz => {
                            let zrank = zetas.find(zr => zr.name === zz.nameKey)
                            if( zrank ) {
                                let charRank = {
                                    name:c.nameKey,
                                    level:(c.level/85),
                                    rarity:(c.rarity/7),
                                    gear:(((c.gear*6)+c.equipped.length)/(13*6)),
                                    zeta:zz,
                                    ranks:(zrank[criteria]/10)
                                }
                                acc.push( charRank )
                            }
                        })
                        return acc
                    },[]);
		
		//console.log('available', available);
		
		available.sort((a,b) => {
                        let arank = (a.ranks.reduce((sum,r) => { return sum + r },0) / a.ranks.length)
                            arank = ((a.level+a.rarity+a.gear)/3) - arank
                        let brank = (b.ranks.reduce((sum,r) => { return sum + r },0) / b.ranks.length)
                            brank = ((b.level+b.rarity+b.gear)/3) - brank
                        return brank - arank
                    })
		
		message += "Unit ranked by: level, rarity, gear\n"
                message += "Zeta scored against: " +criteria+" \n";
                message += "`------------------------------`\n"
		
		let max = 0
                    for( let i = 0; i < 20; i++ ) {
                        if( !available[i] ) { break }
                        let r = (available[i].ranks.reduce((sum,r) => { return sum + r },0) / available[i].ranks.length);
                            r = ((available[i].level+available[i].rarity+available[i].gear)/3) - r;
                        
                        max = r > max ? r : max;
                        message += (r/max).toFixed(1)+" : "+available[i].name+" : "+available[i].zeta.nameKey+"\n";
                    }
		
		message += '------------------------------\n';
		message += 'Optional filter criteria :\n pvp, tw, tb, pit, tank, sith, versa\n';
		
        for( let z of recommendations.zetas ) {
				
            let skill = player.roster.map(u => {
				    
                let ss = u.skills.filter(s => s.nameKey === z.name);
                if( ss.length === 0 ) { return null; }
		    		    
                ss[0].rarity = u.rarity;
                ss[0].level = u.level;
                ss[0].gear = u.gear;
                
                return ss.length > 0 ? ss[0] : null;
		    
            });
	    		
            skill = skill.filter(s => s);
            
            if( !skill || !skill[0] || skill[0].tier === 8 ) { continue; }
            
            z.rarity = skill[0].rarity;
            z.gear = skill[0].gear;
            availableZetas.push(z);
        }
        		
        if( criteria ) {
            availableZetas.sort((a,b) => {
                return scoreZeta(a[criteria], player.roster) - scoreZeta(b[criteria], player.roster) >= 0 ? 1 : -1;
            });
        } else {
            availableZetas.sort((a,b) => {
                return scoreZeta(a, player.roster) - scoreZeta(b, player.roster) >= 0 ? 1 : -1;
            });
        }  
                
        for( let az of availableZetas ) {
            if( lim === 0 ) { break; }
            
            message += ''+az.toon+' : '+az.name+'\n';
            
            --lim;
        }
        
		message += '------------------------------\n';
		message += 'Optional filter criteria :\n pvp, tw, tb, pit, tank, sith, versa\n';
				
			}catch(err){
			message = err.message;	
			}

	return message;
}

function scoreZeta( zeta, roster ) {
    if( typeof zeta === 'number' ) return parseInt(zeta);

    let rankedScore = zeta.pvp * zeta.tw * zeta.tb * zeta.pit * zeta.tank * zeta.sith;
    if( rankedScore === 0 ) { rankedScore = 999 }
    
    let rosterScore = scoreRoster( zeta, roster );
    return rankedScore - rosterScore;
}

function scoreRoster( zeta, roster ) {
    // To-do : build a roster score based on squad support for zeta
    return (zeta.gear * zeta.rarity);
}
