var websocketServerUrl = location.origin.replace(/^http/, 'ws');
var websocket = new WebSocket(websocketServerUrl);

var messageElement = document.querySelector('#messages');

document.querySelector('#nameform').addEventListener('submit', function (event) {
    event.preventDefault();

    var name = document.querySelector('#name').value;

    if (name !== '') {
        websocket.send(JSON.stringify({
            type: 'name',
            name: name
        }));

        document.querySelector('#sendbutton').disabled = false;
    }
});

document.querySelector('#sendform').addEventListener('submit', function (event) {
    event.preventDefault();

    var messageElement = document.querySelector("#sendmessage");
    var message = messageElement.value;
    messageElement.value = ''; // reset

    websocket.send(JSON.stringify({
        type: 'message',
        message: message
    }));
});


websocket.onmessage = function onmessage(event) {
    var data = JSON.parse(event.data);
    console.log(data);

    if (data.type === 'messages') {
        renderMessages(data.messages);
    } else if (data.type === 'message') {
        renderSingleMessage(data);
    } else if (data.type === 'users') {
        renderActiveUsers(data);
        showConnectionMessage(data);
    }
};


function renderMessages(messages) {
    for (var i = 0; i < messages.length; i++) {
        var singleMessage = messages[i];
        renderSingleMessage(singleMessage);
    }
}

function renderSingleMessage(singleMessage) {
    var time = new Date(singleMessage.time);
    var hour = time.getHours();
    var minutes = time.getMinutes();

    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    var messageHtml = `
        <div class="message">
            <span class="name">${singleMessage.name}</span>
            <span class="time">${hour}:${minutes}</span>
            <span class="text">${singleMessage.message}</span>
        </div>
    `;

    messageElement.innerHTML = messageHtml + messageElement.innerHTML;
}

function renderUsers(data) {
}

function renderActiveUsers(data) {
    var activeUsers = data.users;

    var usersElement = document.querySelector('#users');

    var html = '';

    for (var i = 0; i < activeUsers.length; i++) {
        var name = activeUsers[i];
        html += `
            <span class="name">${name}</span>
        `;
    }

    usersElement.innerHTML = html;
}

function showConnectionMessage(data) {
    var message;

    if (data.action === 'joined') {
        message = `${data.name} has joined`;
    } else if (data.action === 'left') {
        message = `${data.name} has left`;
    } else if (data.action === 'renamed') {
        message = `${data.oldname} has changed name to ${data.name}`;
    }

    var html = `<div class="connection">${message}</div>`;

    messageElement.innerHTML = html + messageElement.innerHTML;
}