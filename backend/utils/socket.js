const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // patientId -> socketId

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
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
