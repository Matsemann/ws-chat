'use strict';
var FifoQueue = require('./FifoQueue.js');


class Chat {
    constructor(websocketServer) {
        this.websocketServer = websocketServer;
        this.queue = new FifoQueue(50);
    }

    start() {
        this.websocketServer.on("connection", (ws) => {
            console.log(`[CONNECTED] ${ws._socket.remoteAddress}/${ws.username} connected`);

            ws.on('message', (stringData) => {
                var data = JSON.parse(stringData);

                if (data.type === 'join') {
                    this.sendLatestMessages(ws);
                    this.userJoined(data.name, ws);
                } else if (data.type === 'message') {
                    this.messageSent(data.message, ws);
                }
            });


            ws.on("close", () => {
                this.userLeft(ws);
            })
        });
    }

    sendToAll(data) {
        this.websocketServer.clients.forEach((ws) => {
            ws.send(JSON.stringify(data));
        });
    }


    sendLatestMessages(ws) {
        ws.send(JSON.stringify({
            type: 'messages',
            messages: this.queue.elements
        }));
    }

    userJoined(name, ws) {
        ws.username = name;
        console.log(`[JOINED] ${ws._socket.remoteAddress}/${ws.username} joined`);

        var activeUsers = this.getActiveUsers();

        var userData = {
            type: 'users',
            action: 'joined',
            name: name,
            users: activeUsers
        };

        this.sendToAll(userData);
    }

    userLeft(ws) {
        if (!ws.username) {
            return; // user never joined with a name
        }

        console.log(`[LEFT] ${ws._socket.remoteAddress}/${ws.username} left`);
        var activeUsers = this.getActiveUsers();

        this.sendToAll({
            type: 'users',
            action: 'left',
            name: ws.username,
            users: activeUsers
        });
    }

    getActiveUsers() {
        return this.websocketServer.clients.map((ws) => ws.username);
    }

    messageSent(message, ws) {
        console.log(`[MESSAGE] ${ws._socket.remoteAddress}/${ws.username} sent: ${message}`);

        this.queue.add({
            name: ws.username,
            message: message
        });

        this.sendToAll({
            type: 'message',
            name: ws.username,
            message: message
        });
    }

}

module.exports = Chat;