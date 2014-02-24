var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8080}),
    wampio = require('wamp.io');
    app = require('./app'),
    http = require('http');


var wampServer = wampio.attach(wss);

wampServer.on('call', function(procUri, args, cb) {
    if (procUri === 'test') {
        console.log("Test!");
    }
});