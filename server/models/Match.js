// Import Mongoose library
const mongoose = require('mongoose');

// Define the Match model in MongoDB
const MatchSchema = new mongoose.Schema ({
    date: { // date of match
        type: Date,
        required: true
    },
    map: { // map played
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    agent: { // agent used
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    roundsPlayed: { // total number of rounds played
        type: Number,
        required: true
    },
    result: { // whether you've won or lost the match
        type: String,
        required: true
    },
    teamScore: { // number of rounds won by your team
        type: Number,
        required: true
    },
    opponentScore: { // number of rounds lost by your team
        type: Number,
        required: true
    },
    place: { // placement out of all players
        type: Number,
        required: true
    },
    kills: { // number of kills
        type: Number,
        required: true
    },
    deaths: { // number of deaths
        type: Number,
        required: true
    },
    assists: { // number of assists
        type: Number,
        required: true
    },
    headshot: { // number of headshots
        type: Number,
        required: true
    },
    aceCount: { // number of aces
        type: Number,
        required: true
    },
    dmgDealt: { // damage dealt throughout match
        type: Number,
        required: true
    },
    dmgReceived: { // damage received throughout match
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Match', MatchSchema);