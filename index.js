var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/client"));

var server = http.createServer(app);
server.listen(port);
console.log("http server listening on %d", port);

var websocketServer = new WebSocketServer({server: server});
console.log("websocket server created");

websocketServer.on("connection", function (ws) {
    console.log(`[CONNECTED] ${ws._socket.remoteAddress}/${ws.username} connected`);

    ws.on('message', function (stringData) {
        var data = JSON.parse(stringData);

        if (data.type === 'join') {
            userJoined(data.name, ws);
        } else if (data.type === 'message') {
            messageSent(data.message, ws);
        }
    });


    ws.on("close", function () {
        userLeft(ws);
    })
});


function sendToAll(data) {
    websocketServer.clients.forEach(function (ws) {
        ws.send(JSON.stringify(data));
    });
}

function userJoined(name, ws) {
    ws.username = name;
    console.log(`[JOINED] ${ws._socket.remoteAddress}/${ws.username} joined`);

    var activeUsers = getActiveUsers();

    var userData = {
        type: 'users',
        action: 'joined',
        name: name,
        users: activeUsers
    };

    sendToAll(userData);
}

function userLeft(ws) {
    if (!ws.username) {
        return; // user never joined with a name
    }

    console.log(`[LEFT] ${ws._socket.remoteAddress}/${ws.username} left`);
    var activeUsers = getActiveUsers();

    var userData = {
        type: 'users',
        action: 'left',
        name: ws.username,
        users: activeUsers
    };

    sendToAll(userData);
}

function getActiveUsers() {
    return websocketServer.clients.map(function (ws) {
        return ws.username;
    });
}

function messageSent(message, ws) {
    console.log(`[MESSAGE] ${ws._socket.remoteAddress}/${ws.username} sent: ${message}`);

    var messageData = {
        type: 'message',
        name: ws.username,
        message: message
    };

    sendToAll(messageData);
}