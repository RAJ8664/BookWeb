const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Routes
const bookRoutes = require('./src/books/book.route');
app.use('/api/books', bookRoutes);

// Connect to MongoDB
async function main() {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected Successfully");
}

main().catch(err => console.log(err));

// Default route (AFTER all routes)
app.get("/", (req, res) => {
    res.send("Welcome to my server!");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
