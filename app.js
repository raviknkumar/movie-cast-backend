const express = require('express');
const http = require('http');
const app = express();
// import socket io to use it
const socketio = require('socket.io');
// const {getCurrentTime} = require('@utils/datetimeutils');
const { getCurrentTime } = require('./utils/datetimeutils');
const formatMessage = require('./utils/messages');
const { userJoin } = require('./utils/users');

// server for socket io
const server = http.createServer(app);

// socket setup
// binding our server with socket-io
const io = socketio(server);

const botName = 'admin';

// listen for events
io.on('connection', socket => {
    
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
    socket.broadcast
        .to(user.room)
        .emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat`)
        );

    // broadcasting user message
    socket.on('chatMessage', msg => {
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));    
    });

    // handle user left
    socket.on('disconnect', () => {
        //const user = userLeave(socket.id);
    
        //if (user) {
          io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat`)
          );
        //}
      });
});

// write it at the end
// instead of app.listen, using server.listen
server.listen(3001, () => {
    console.log('Listening on Port 3001');
});