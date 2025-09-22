const express = require('express');
const cors = require('cors');
const { query } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({
      status: 'OK',
      message: 'Smart City Waste Management API is running',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/citizens', require('./routes/citizens'));
app.use('/api/bins', require('./routes/bins'));
app.use('/api/trucks', require('./routes/trucks'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart City Waste Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      citizens: '/api/citizens',
      bins: '/api/bins',
      trucks: '/api/trucks',
      routes: '/api/routes',
      events: '/api/events',
      reports: '/api/reports',
      notifications: '/api/notifications'
    },
    documentation: '/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/citizens',
      'GET /api/bins',
      'GET /api/trucks',
      'GET /api/routes',
      'GET /api/events',
      'GET /api/reports',
      'GET /api/notifications'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart City Waste Management API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
