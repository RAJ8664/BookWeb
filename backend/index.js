const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// Use port in local development
const port = process.env.PORT || 5000;

// Load environment variables from .env.local, then fall back to .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Validate critical environment variables
const requiredEnvVars = ['DB_URL', 'JWT_SECRET_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and restart the server');
  process.exit(1);
}

// Add request logger middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url} | ${req.headers['content-type'] || 'no content-type'}`);
  next();
});

// middleware
app.use(express.json());

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'  // Also allow access from 127.0.0.1
];

// Remove the separate CORS pre-flight middleware as it might be causing conflicts
// app.options('*', cors());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    // Return the specific origin instead of true to avoid wildcard
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Connect to MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// routes
const bookRoutes = require('./src/books/book.route');
const bulkBookRoutes = require('./src/books/bulk.route');
const orderRoutes = require("./src/orders/order.route")
const userRoutes =  require("./src/users/user.route")
const adminRoutes = require("./src/stats/admin.stats")
const bookRequestRoutes = require('./src/routes/bookRequest.route');
const esewaRoutes = require('./src/routes/esewa.route');

// Register API routes
app.use("/api/books", bookRoutes)
app.use("/api/books/bulk", bulkBookRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/auth", userRoutes)
app.use("/api/admin", adminRoutes)
app.use('/api/book-requests', bookRequestRoutes);
app.use('/api/payments/esewa', esewaRoutes);

// This catch-all route should be registered AFTER all other routes
app.get("/", (req, res) => {
  res.send("BookWeb Server is running!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
