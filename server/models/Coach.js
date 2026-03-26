const mongoose = require('mongoose');
const User = require('./User');

// Define the Coach model in MongoDB
const CoachSchema = new mongoose.Schema({
    title: { // title of the coach (e.g. Head Coach, Assistant Coach)
        type: String,
        required: true,
        default: 'Head Coach',
        enum: ['Head Coach', 'Assistant Coach', 'Analyst', 'Manager']
    },
    company: { // optional company/organization the coach is affiliated with
        type: String,
        default: null
    },
});

// Create the Coach model as a discriminator of User
const Coach = User.discriminator('Coach', CoachSchema);

module.exports = Coach;
