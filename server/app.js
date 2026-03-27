require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const playerRoutes = require('./routes/playerRoutes');

app.use('/api/players', playerRoutes);
app.use('/api/users', userRoutes);

module.exports = app;