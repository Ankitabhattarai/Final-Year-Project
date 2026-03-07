require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin/system', require('./routes/superAdminRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/hospital', require('./routes/hospital'));
app.use('/api/hospitals/apply', require('./controllers/hospitalRegistrationController').applyHospital);
app.use('/api/users', require('./routes/users'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/patients', require('./routes/patient'));
app.use('/api/patient-dashboard', require('./routes/patientDashboardRoutes'));
app.use('/api/doctor-dashboard', require('./routes/doctorDashboardRoutes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const http = require('http');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});