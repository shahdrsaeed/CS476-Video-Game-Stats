// Import Mongoose library
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  map: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Map',
    required: true
  },

  datePlayed: {
    type: Date,
    default: Date.now
  },

  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },

    team: {
      type: String,
      enum: ['A', 'B'],
      required: true
    },

    stats: {
      kills: { type: Number, required: true },
      deaths: { type: Number, required: true },
      assists: { type: Number, required: true },

      headshots: Number,
      bodyshots: Number,
      legshots: Number,

      firstBloods: Number,
      aces: Number
    }
  }],

  result: {
    winningTeam: {
      type: String,
      enum: ['A', 'B'],
      required: true
    }
  }
});

module.exports = mongoose.model('Match', MatchSchema);