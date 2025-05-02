// Direct handler for Vercel deployment
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create express app
const app = express();

// Configure CORS
app.use(cors({
  origin: 'https://book-web-eight-lyart.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add basic middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Import routes
const bookRoutes = require('./src/books/book.route');
const bulkBookRoutes = require('./src/books/bulk.route');
const orderRoutes = require('./src/orders/order.route');
const userRoutes = require('./src/users/user.route');
const adminRoutes = require('./src/stats/admin.stats');
const bookRequestRoutes = require('./src/routes/bookRequest.route');
const esewaRoutes = require('./src/routes/esewa.route');

// Register routes
app.use('/api/books', bookRoutes);
app.use('/api/books/bulk', bulkBookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/payments/esewa', esewaRoutes);

// MongoDB connection
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.DB_URL);
    isConnected = true;
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Root route
app.get('/', (req, res) => {
  res.send('Book Store Server is running!');
});

// Export Vercel serverless function
module.exports = async (req, res) => {
  try {
    // Connect to database before handling request
    await connectToDatabase();
    // Use express to handle the request
    app(req, res);
  } catch (error) {
    console.error('Error in Vercel function:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 