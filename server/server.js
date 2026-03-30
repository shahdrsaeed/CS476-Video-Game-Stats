const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 8080;

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io WITH CORS config
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
  }
});

// Make io globally accessible (you already use this)
global.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});