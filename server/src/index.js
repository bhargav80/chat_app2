const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const {generateMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 8000;

io.on('connection', (socket) => {

 
  socket.on('join', ({username, room}, callback) => {
    const {error, user} = addUser({ socketId: socket.id, username, room });

    
    if(error) {
      callback(error);
      return;
    }

    socket.join(user.room);
    
    socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    
    
    io.to(user.room).emit('roomData', {
      users: getUsersInRoom(user.room)
    });

    callback();
  });
  

  
  socket.on('sendMessage', (message, callback) => {
    try {
      const user = getUser(socket.id);
      if(!user) {
        throw 'User not found!';
      }

      io.to(user.room).emit('message', generateMessage(user.username, message));
      callback();
    } catch (error) {
      callback(error.message);
    }
  });



  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});