var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();
var port = process.env.PORT || 5000;
var chat = require('./chat');


// Serve the files in the /client folder when visiting the server through http
app.use(express.static(__dirname + "/client"));
var server = http.createServer(app);
server.listen(port);
console.log("http server listening on %d", port);

// create a websocket server, and pass it to our chat-logic
var websocketServer = new WebSocketServer({server: server});
console.log("websocket server created");

chat.start(websocketServer);