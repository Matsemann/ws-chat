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

document.querySelector('#send').addEventListener('submit', function (event) {
    event.preventDefault();

    var message = document.querySelector("#message").value;

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
    }
};


function renderMessages(messages) {
    for (var i = 0; i < messages.length; i++) {
        var singleMessage = messages[i];
        renderSingleMessage(singleMessage);
    }
}

function renderSingleMessage(singleMessage) {
    var messageHtml = `
        <div class="message">
            <span class="name">${singleMessage.name}: </span>
            ${singleMessage.message}
            <span class="time">${singleMessage.time}</span>
        </div>
    `;

    messageElement.innerHTML = messageHtml + messageElement.innerHTML;
}