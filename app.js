const express = require('express');
const http = require('http');
const app = express();
// import socket io to use it
const socketio = require('socket.io');
// const {getCurrentTime} = require('@utils/datetimeutils');
const { getCurrentTime } = require('./utils/datetimeutils');
const formatMessage = require('./utils/messages');
const { userJoin } = require('./utils/users');


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

// server for socket io
const server = http.createServer(app);

// socket setup
// binding our server with socket-io
const io = socketio(server);

const botName = 'admin';

// listen for events
io.on('connection', onConnect);

function onConnect(socket){
    
    console.log("New client connected: " + socket.id);
    //console.log("Query: ", socket.handshake.query);
    const {username, room} = socket.handshake.query
    console.log(`User ${username} has joined to Room ${room}`);
    // add user to local state
    const user = userJoin(socket.id, username, room);
    
    // greet current user
    socket.emit('message', formatMessage('Admin', `Hi ${user.username} Welcome to the app!`));

    // join to specific room
    socket.join(user.room);

    // inform other user, Broadcast when a user connects
    console.log(`Sending Message To All Users As ${user.username} joined`);
    socket.to(user.room)
        .emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat`)
        );

    // broadcasting user message
    socket.on('chatMessage', msg => {
        console.log(`Sending Chat Message to All receiver from ${user.username}`);
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));    
    });

    // handle user left
    socket.on('disconnect', () => {
        // const user = userLeave(socket.id);
        
        console.log(`Sending Disconnect Message As ${user.username} disconnected`);
        //if (user) {
          io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat`)
          );
        //}
      });
}

app.get('/test', (req, res) => {
  console.log('Test Success');
  res.send("TestEndPoint, Dive for some other thing");
})

// handle logout
app.get("/logout", function(req,res){
  //do other logging out stuff
  disconnectUser(req.query.socketId);
  res.send("Logout successful");
});

disconnectUser = function(socketId){
  io.sockets.connected[socketId].disconnect();
}

// write it at the end
// instead of app.listen, using server.listen
let port = process.env.port || 3005;
server.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});