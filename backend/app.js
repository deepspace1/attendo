const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendanceRoutes');
const barcodeRoutes = require('./routes/barcodeRoutes');
const studentsRoutes = require('./routes/students');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';

let isMongoConnected = false;

const connectWithRetry = () => {
  console.log('Attempting MongoDB connection...');
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('Connected to MongoDB');
      isMongoConnected = true;
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      isMongoConnected = false;
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Middleware to check MongoDB connection before processing requests
app.use((req, res, next) => {
  if (!isMongoConnected) {
    return res.status(503).json({ message: 'MongoDB not connected. Please try again later.' });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api', barcodeRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', require('./routes/courses'));

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
