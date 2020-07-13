const express = require('express');
const http = require('http');
const app = express();
// import socket io to use it
const socketio = require('socket.io');
// const {getCurrentTime} = require('@utils/datetimeutils');
const { getCurrentTime } = require('./utils/datetimeutils');
const formatMessage = require('./utils/messages');

// server for socket io
const server = http.createServer(app);

// socket setup
// binding our server with socket-io
const io = socketio(server);

const botName = 'admin';

// listen for events
io.on('connection', socket => {
    
    console.log("New client connected: " + socket.id);
    
    // greet current user
    socket.emit('message', formatMessage('Admin', 'Welcome to the app!'));

    // inform other user, Broadcast when a user connects
    socket.broadcast
        .emit(
            'message',
            formatMessage(botName, `User has joined the chat`)
        );

    // broadcasting user message
    socket.on('chatMessage', msg => {
        socket.broadcast.emit('message', formatMessage('user.username', msg));    
    });

    // handle user left
    socket.on('disconnect', () => {
        //const user = userLeave(socket.id);
    
        //if (user) {
          io.emit(
            'message',
            formatMessage(botName, `user.username has left the chat`)
          );
        //}
      });
});

// write it at the end
// instead of app.listen, using server.listen
server.listen(3001, () => {
    console.log('Listening on Port 3001');
});