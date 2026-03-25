// Load environment variables from .env file for MongoDB connection
require('dotenv').config();

// Use Google's DNS to resolve MongoDB SRV records on Windows
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/db'); // Function used to call connectDB()
const corsOptions = {
    origin: 'http://localhost:5173', // Adjust this to your frontend's URL
};

// Enable CORS for frontend requests
app.use(cors(corsOptions));

// Connect to MongoDB Atlas
connectDB();

app.get('/api', (req, res) => {
    res.json({"fruits": ["apple", "banana", "orange"]});
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
