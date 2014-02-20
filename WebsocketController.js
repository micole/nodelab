var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 8080}),
	commands = {},
	tickDelay = 1500,
	endpoint = 'localhost:3000',
	// endpoint = 'appendixg.com:3000',
	app = require('./app'),
	http = require('http');

//When the connection is made, execute this function and set a handler
//for any further incoming messages. Also immediately send a welcome to the other side.
wss.on('connection', function(ws) {

	ws.on('message', function(message) {
		console.log("Message received: %s", message);
		var m = JSON.parse(message);
		
		if (typeof m === "object" && m.hasOwnProperty("push" && m[2] == "broadcast")) {
			//Put command in the global endpoint broadcast map
			http.get(endpoint + '/addcmd?id=' + m[1] + '&directive=' + m[1], function(res) {
				console.log("Result from adding command: ");
				console.log(res);
			});
		} else if (m[2] == "direct") {
			//directly issue a command to IRC
			app.bot.say('#twitchplayspokemon', m[1]);
		} else if (m[0] === "start") {
			app.connectIrcBot();
		}
	});

	ws.send(JSON.stringify({"welcome": "Welcome"}));
});

//Broadcast commands to clients
function doThingsOnGlobal() {
	for (var id in commands) {
		if (commands.hasOwnProperty(id)) {
			wss.broadcast({
				from: id,
				directive: commands[id]
			});
		}
	}

	//Reset the command map
	commands = {};
}

//Create broadcast functionality on the server
wss.broadcast = function(data) {
	data = JSON.stringify(data);

	for (var i in this.clients) {
		this.clients[i].send(data);
	}
}

//Call a function on a tick delay
var globalTick = setInterval(doThingsOnGlobal, tickDelay);