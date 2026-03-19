const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    region: {
        type: String,   // Ex. NA, EU, APAC
        required: true,
        enum: ['Americas', 'EMEA', 'APAC', 'China' ] // restrict region to these values
    },
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    }]
}, {timestamps: true});

module.exports = mongoose.model('Team', TeamSchema);