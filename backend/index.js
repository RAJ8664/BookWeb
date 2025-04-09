const express = require('express');
const mongoose = require('mongoose');


const app = express();
const cors = require('cors');



const port = process.env.PORT || 5000;
require('dotenv').config()

// Middleware

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173/',
    credentials: true,
}));

// Routes

const bookRoutes = require('./src/books/book.route');
app.use('/api/books', bookRoutes);

async function main() {
    await mongoose.connect(process.env.DB_URL);
    app.use('/', (req, res) => {
        res.send('Welcome to my server!');
    })
  }

  main().then(() => console.log("MongoDB connected Successfully")).catch(err => console.log(err));




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
