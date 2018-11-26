const pushmessage = require('../Commands/Pushmessage');


const zitate = 
      [
        'Eine lächerliche Befreiungsaktion!', 
        'Bei jemandem mit deinem Ruf hätte ich erwartet, dass du ein wenig älter wärst.',
        'Jedi-Abschaum!',
        'Eure Laserschwerter werden meine Sammlung hervorragend ergänzen.',
        'Zermalmt sie - sie sollen leiden!',
        'General Kenobi, Eure Kühnheit ist beeindruckend.',
        'Dieser Jedi-Abschaum gehört mir!',
        'Armee hin oder her, Euch muss klar sein, dass Ihr verloren seid!',
        'Kämpft weiter, doch es wird euch nichts nützen!',
        'Ihr seht eurem Ende entgegen, Kenobi!',
        'Ihr seid gut, Meister Kenobi, aber nicht gut genug!',
        'Mörder? Ist es Mord, wenn man die Galaxis von euch Jedi-Abschaum befreit?',
        'Seid gegrüßt, Jedi. Wieder einmal ist ein Mitglied eures Ordens in meine Fänge geraten. Doch was noch besser ist: Es handelt sich um ein führendes Mitglied eures Jedi-Rates. Jetzt hört mir gut zu, Jedi: Ich schere mich nicht um eure Politik, ich schere mich nicht um eure Republik. Ich lebe einzig und allein, um euch sterben zu sehen.'
      ];

module.exports = async ( groupId ) => {
	try {
    pushmessage(groupId, getRandomMessage());
	} catch(e) {
  		console.log(e.message);
	}

}

function getRandomMessage()
{
  let ran = getRandomInt(zitate.length);
  return zitate[ran];  
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
