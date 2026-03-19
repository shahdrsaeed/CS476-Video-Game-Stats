const mongoose = require('mongoose');
const User = require('./User');

// Define the Coach model in MongoDB
const CoachSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team', // reference to the Team model
        required: true, 
    }

});

// Create the Coach model as a discriminator of User
const Coach = User.discriminator('Coach', CoachSchema);

module.exports = Coach;
