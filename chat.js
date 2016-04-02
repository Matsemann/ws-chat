var FifoQueue = require('./FifoQueue.js');

var websocketServer, queue;
function start(server) {
    websocketServer = server;
    queue = new FifoQueue(50);

    websocketServer.on("connection", function (ws) {
        console.log(`[CONNECTED] ${ws._socket.remoteAddress}/${ws.username} connected`);

        ws.on('message', function (stringData) {
            var data = JSON.parse(stringData);

            if (data.type === 'join') {
                sendLatestMessages(ws);
                userJoined(data.name, ws);
            } else if (data.type === 'message') {
                messageSent(data.message, ws);
            }
        });


        ws.on("close", function () {
            userLeft(ws);
        })
    });
}

function sendToAll(data) {
    websocketServer.clients.forEach(function (ws) {
        ws.send(JSON.stringify(data));
    });
}

function sendLatestMessages(ws) {
    ws.send(JSON.stringify({
        type: 'messages',
        messages: queue.elements
    }));
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

    sendToAll({
        type: 'users',
        action: 'left',
        name: ws.username,
        users: activeUsers
    });
}

function getActiveUsers() {
    return websocketServer.clients.map(function (ws) {
        return ws.username;
    });
}

function messageSent(message, ws) {
    console.log(`[MESSAGE] ${ws._socket.remoteAddress}/${ws.username} sent: ${message}`);

    queue.add({
        name: ws.username,
        message: message
    });

    sendToAll({
        type: 'message',
        name: ws.username,
        message: message
    });
}


module.exports = {
    start: start
};