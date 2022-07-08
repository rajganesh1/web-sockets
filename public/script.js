const socket = io('http://localhost:3000');
const messageconatiner = document.getElementById('message-container');
const messageform = document.getElementById('send-container');
const roomcontainer = document.getElementById('room-container');
const messageinput = document.getElementById('message-input');

if(messageform!=null){
    const name = prompt('What is your name?');
    if(name != undefined && name!= null && name.length!=0){

        socket.on('new-room', room => {
            const roomElement = document.createElement('div');
            roomElement.innerText = room;
            const roomLink = document.createElement('a');
            roomLink.href = `${room}`;
            roomLink.innerText = 'join';
            roomcontainer.append(roomElement);
            roomcontainer.append(roomLink);
        })

        appendmessage('You joined the chat');
        socket.emit('new-user', roomName, name);
    
        socket.on('print-users', userlist => {
            for(let i=0;i<userlist.length;i++){
                if(name != userlist[i]){
                    appendmessage(`${userlist[i]} joined`);
                }
            }
        })
    
        socket.on('chat-message', data =>{
            appendmessage(`${data.name}: ${data.message}`);
        })
    
        socket.on('user-connected', name =>{
            appendmessage(`${name} joined`);
        })
    
        socket.on('user-disconnected', name =>{
            appendmessage(`${name} disconected`);
        })
    
        messageform.addEventListener('submit', e=>{
            e.preventDefault();
            const message = messageinput.value;
            appendmessage(`You: ${message}`);
            socket.emit('send-chat-message',roomName, message);
            messageinput.value = '';
        })
    
        function appendmessage(message){
            const messageelement = document.createElement('div');
            messageelement.innerText = message;
            messageconatiner.append(messageelement);
        }
    } 
}