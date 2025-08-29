const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++;
  io.emit('userConnected');
  
  console.log(`User connected. Total users: ${connectedUsers}`);

  socket.on('createColumn', (data) => {
    socket.broadcast.emit('createColumn', data);
  });

  socket.on('updateColumn', (data) => {
    socket.broadcast.emit('updateColumn', data);
  });

  socket.on('deleteColumn', (data) => {
    socket.broadcast.emit('deleteColumn', data);
  });

  socket.on('createTask', (data) => {
    socket.broadcast.emit('createTask', data);
  });

  socket.on('updateTask', (data) => {
    socket.broadcast.emit('updateTask', data);
  });

  socket.on('deleteTask', (data) => {
    socket.broadcast.emit('deleteTask', data);
  });

  socket.on('moveTask', (data) => {
    socket.broadcast.emit('moveTask', data);
  });

  socket.on('disconnect', () => {
    connectedUsers = Math.max(0, connectedUsers - 1);
    io.emit('userDisconnected');
    console.log(`User disconnected. Total users: ${connectedUsers}`);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
