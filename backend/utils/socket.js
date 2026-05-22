const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // patientId -> socketId

const initSocket = (server, allowedOrigins = ['http://localhost:5173']) => {
  // Normalize allowed origins (strip trailing slash and lowercase)
  const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/*$/, '').toLowerCase());
  io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const n = origin.replace(/\/*$/, '').toLowerCase();
        if (normalizedAllowed.includes('*') || normalizedAllowed.includes(n)) {
          callback(null, true);
          return;
        }
        callback(new Error('Socket origin not allowed by CORS'));
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('register', (userId) => {
      userSockets.set(userId?.toString(), socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Find and remove the socket from the map
      for (const [patientId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(patientId);
          console.log(`Patient ${patientId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

const sendSocketNotification = (patientId, data) => {
  if (!io) return;
  const socketId = userSockets.get(patientId.toString());
  if (socketId) {
    io.to(socketId).emit('notification', data);
  }
};

module.exports = {
  initSocket,
  sendSocketNotification
};
