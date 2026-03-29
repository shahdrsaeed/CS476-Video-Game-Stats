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
const coachRoutes = require('./routes/coachRoutes');
const teamRoutes = require('./routes/teamRoutes');
const mapRoutes = require('./routes/mapRoutes');
const matchRoutes = require('./routes/matchRoutes');
const requestRoutes = require('./routes/requestRoutes');

app.use('/api/players', playerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);

module.exports = app;