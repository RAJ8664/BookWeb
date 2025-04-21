const express = require("express");
const app = express();
const cors = require("cors");

const mongoose = require("mongoose");
// Only use port in local development
const port = process.env.PORT || 5000;

// Load environment variables from .env.local, then fall back to .env
require('dotenv').config({ path: '.env.local' });  
require('dotenv').config(); // This will not overwrite existing env vars

// Validate critical environment variables
const requiredEnvVars = ['DB_URL', 'JWT_SECRET_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and restart the server');
  // Don't exit in production/serverless (will crash the function)
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
}

// Add request logger middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url} | ${req.headers['content-type'] || 'no content-type'}`);
  next();
});

// middleware
app.use(express.json());

// Configure CORS with more options
const allowedOrigins = [
  'http://localhost:5173',
  'https://book-web-eight-lyart.vercel.app',
  'https://book-web-bishal-roys-projects.vercel.app'
];

// CORS pre-flight middleware
app.options('*', cors());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Manually set CORS headers for all routes as a backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Connect to MongoDB
// For Vercel, we connect for each request rather than keeping a persistent connection
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }
  
  try {
    await mongoose.connect(process.env.DB_URL);
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Middleware to ensure DB connection for all routes
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Failed to connect to database');
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// routes
const bookRoutes = require('./src/books/book.route');
const bulkBookRoutes = require('./src/books/bulk.route');
const orderRoutes = require("./src/orders/order.route")
const userRoutes =  require("./src/users/user.route")
const adminRoutes = require("./src/stats/admin.stats")
const bookRequestRoutes = require('./src/routes/bookRequest.route');

// Register API routes
app.use("/api/books", bookRoutes)
app.use("/api/books/bulk", bulkBookRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/auth", userRoutes)
app.use("/api/admin", adminRoutes)
app.use('/api/book-requests', bookRequestRoutes);

// This catch-all route should be registered AFTER all other routes
app.get("/", (req, res) => {
  res.send("Book Store Server is running!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Only start the server in development mode, not in production/serverless
if (process.env.NODE_ENV === 'development') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Server environment: development`);
  });
}

// Export a handler that can be used by Vercel
module.exports = app;
