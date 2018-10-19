const tmi = require('tmi.js');




const tmiConfig = {
    options: {
        debug: true
    },
    connection: {
        reconnect:  true
    },
    identity: {
        username: "amaunatbot",
        password: "c22t8h7voeq3okwimhu4fa0gd0u3yd"
    },
    channels: [
        "haruninho"
    ]
};
const prefix = "!";

var shell = require('shelljs')

var vote_status = false;

var map = {};

var pseudos = {};

function isBroadcaster(user){
	console.log(user.badges);
	if(!user.badges){
		return false;
	}else{
		return user.badges.broadcaster == '1';
	}
}

if (!shell.which('btc-price')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}


let client = new tmi.client(tmiConfig);

client.connect();

function commandParser(message){
    let prefixEscaped = prefix.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    let regex = new RegExp("^" + prefixEscaped + "([a-zA-Z]+)\s?(.*)");
    return regex.exec(message);
}


client.on('chat', (channel, user, message, isSelf) => {
    if (isSelf) return;

    let fullCommand = commandParser(message);
    
    if(fullCommand){
        let command = fullCommand[1];
        let param = fullCommand[2];
        switch(command){
            case "convert":
				prix = shell.exec('btc-price -e');
				prix = prix.substring(1).replace(",","");
				res = param * (prix/1000000) ;
				if(!isNaN(res)){
					client.say(channel, Math.round(res*100)/100 + "€");
				}
				else{
					client.say(channel, "Entrez un numéro !");
				}
                break;
            case "vote":
				
				if(isBroadcaster(user)){
					if(!vote_status){
						client.say(channel, "Lancement du vote");
						vote_status = true;
					}else{
						client.say(channel, "Fin du vote");
						vote_status = false;
						for (var key in map) {
						 if (map.hasOwnProperty(key) && map[key]>1) {
						   client.say(channel, key + " a récolté " + map[key] + " vote(s)");
						 }
						}
						map = new Map();
						pseudos = new Map();
					}
				}else{
					if(vote_status){
						if(pseudos[user['display-name']] == undefined){
							pseudos[user['display-name']] = "a_vote";
							var words = param.split(' ');
							if(map[words[1]] == undefined){
								map[words[1]] = 1;
							}else{
								map[words[1]] = map[words[1]] + 1;
							}
						}
					}else{	
						client.say(channel, "Aucun vote en cours");
					}
				}		
				break;
        }
    }
});

