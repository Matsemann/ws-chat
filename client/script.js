var websocketServerUrl = 'ws://localhost:5000';
var websocket = new WebSocket(websocketServerUrl);


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
    console.log(event);
////    var li = document.createElement('li');
////    li.innerHTML = event.data;
////    document.querySelector('#pings').appendChild(li);
};