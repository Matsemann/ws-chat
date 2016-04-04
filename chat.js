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

                if (data.type === 'name') {
                    this.setName(sanitizeHtml(data.name), ws);
                } else if (data.type === 'message') {
                    this.messageSent(sanitizeHtml(data.message), ws);
                }
            });

            ws.on("close", () => {
                this.userLeft(ws);
            })
        });

        setInterval(() => {
            console.log("pinging all clients so heroku doesn't close the connection");
            this.websocketServer.clients.forEach((ws) => {
                ws.ping();
            });
        }, 30 * 1000);
    }

    sendToAll(data) {
        this.websocketServer.clients
            .filter((ws) => ws.username) // only send to those who have joined with a name
            .forEach((ws) => {
            ws.send(JSON.stringify(data));
        });
    }


    sendLatestMessages(ws) {
        ws.send(JSON.stringify({
            type: 'messages',
            messages: this.queue.elements
        }));
    }

    setName(name, ws) {
        if (ws.username) {
            if (ws.username !== name) {
                this.userRenamed(name, ws);
            }
        } else {
            this.sendLatestMessages(ws);
            this.userJoined(name, ws);
        }
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

    userRenamed(name, ws) {
        var oldname = ws.username;

        ws.username = name;
        console.log(`[RENAMED] ${ws._socket.remoteAddress}/${ws.username} from ${oldname}`);

        var activeUsers = this.getActiveUsers();

        var userData = {
            type: 'users',
            action: 'renamed',
            name: name,
            oldname: oldname,
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
        return this.websocketServer.clients
            .map((ws) => ws.username)
            .filter((name) => name);
    }

    messageSent(message, ws) {
        console.log(`[MESSAGE] ${ws._socket.remoteAddress}/${ws.username} sent: ${message}`);

        var time = new Date();

        this.queue.add({
            name: ws.username,
            message: message,
            time: time
        });

        this.sendToAll({
            type: 'message',
            name: ws.username,
            message: message,
            time: time
        });
    }

}

function sanitizeHtml(string) {
    return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = Chat;