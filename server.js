const express = require('express');
const app = express();
const server = require('http').Server(app);
const cors = require('cors');

const io = require('socket.io')(server,{
    cors: {
        origin: 'http://127.0.0.1:5500', 
        origin: 'http://127.0.0.1:3000',
    },
});

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));

const rooms = [];

app.get('/', (req,res)=>{
    res.render('index', {rooms: rooms});
})

app.post('/room', (req,res)=>{
    if(rooms[req.body.room]!=null){
        return res.redirect('/');
    }
    rooms[req.body.room] = {users: []};
    res.redirect(req.body.room);

    io.emit('new-room', req.body.room);
})

app.get('/:room', (req,res)=>{
    if(rooms[req.params.room] == null){
        return res.redirect('/');
    }
    res.render('room', {roomName: req.params.room});
})

server.listen(3000, (req,res)=>{
    console.log('Listening to port 3000....');
})

var userlist = new Array();

io.on('connection', socket => {
    socket.on('new-user', (room,name) =>{
        socket.join(room);
        if(userlist[rooms[room]] == null){
            userlist[rooms[room]] = new Array();
        }
        rooms[room].users[socket.id]=name;
        userlist[rooms[room]].push(name);
        socket.emit('print-users',userlist[rooms[room]]);
        socket.broadcast.to(room).emit('user-connected', name);
    })
    socket.on('send-chat-message', (room,message) =>{
        socket.broadcast.to(room).emit('chat-message', {message: message,
            name: rooms[room].users[socket.id]
        });
    })
    socket.on('disconnect', ()=>{
        getUserRooms(socket).forEach(room => {
            if(rooms[room].users[socket.id]!= null){
                socket.broadcast.to(room).emit('user-disconnected', rooms[room].users[socket.id]);
                delete rooms[room].users[socket.id];
            }
        })
    })
})

function getUserRooms(socket){
    return Object.entries(rooms).reduce((names, [name,room])=>{
        if(room.users[socket.id]!=null){
            names.push(name);
        }
        return names;
    },[])
}

//check all rooms and all users.. return all names of
//rooms that the user is part of
