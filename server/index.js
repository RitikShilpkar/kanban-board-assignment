const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "https://kanban-board-assignment-seven.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let connectedUsers = new Set();

io.on('connection', (socket) => {
  connectedUsers.add(socket.id);
  
  console.log(`User connected. Total users: ${connectedUsers.size}`);
  
  socket.emit('userConnected', { userId: socket.id, totalUsers: connectedUsers.size });
  socket.broadcast.emit('userConnected', { userId: socket.id, totalUsers: connectedUsers.size });

  socket.on('createColumn', (data) => {
    console.log('Broadcasting createColumn:', data);
    socket.broadcast.emit('createColumn', data);
  });

  socket.on('updateColumn', (data) => {
    console.log('Broadcasting updateColumn:', data);
    socket.broadcast.emit('updateColumn', data);
  });

  socket.on('deleteColumn', (data) => {
    console.log('Broadcasting deleteColumn:', data);
    socket.broadcast.emit('deleteColumn', data);
  });

  socket.on('moveColumn', (data) => {
    console.log('Broadcasting moveColumn:', data);
    socket.broadcast.emit('moveColumn', data);
  });

  socket.on('createTask', (data) => {
    console.log('Broadcasting createTask:', data);
    socket.broadcast.emit('createTask', data);
  });

  socket.on('updateTask', (data) => {
    console.log('Broadcasting updateTask:', data);
    socket.broadcast.emit('updateTask', data);
  });

  socket.on('deleteTask', (data) => {
    console.log('Broadcasting deleteTask:', data);
    socket.broadcast.emit('deleteTask', data);
  });

  socket.on('moveTask', (data) => {
    console.log('Broadcasting moveTask:', data);
    socket.broadcast.emit('moveTask', data);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log(`User disconnected. Total users: ${connectedUsers.size}`);
    io.emit('userDisconnected', { totalUsers: connectedUsers.size });
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
