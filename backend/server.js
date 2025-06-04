
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const client = require('prom-client'); // Prometheus client

const app = express();

app.use(express.static(path.join(__dirname, '../frontend/public')));


// Prometheus setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(requestCounter);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Track every request for metrics
app.use((req, res, next) => {
    res.on('finish', () => {
        requestCounter.labels(req.method, req.path, res.statusCode).inc();
    });
    next();
});

// Prometheus metrics route
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected successfully');
    mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (err) {
            console.error('Error listing collections:', err);
        } else {
            console.log('Available collections:', collections.map(c => c.name));
        }
    });
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Attendance Management System API' });
});

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/upload-scan', require('./routes/uploadScan'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
