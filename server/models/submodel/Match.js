const mongoose = require('mongoose');
const RoundSchema = require('./Round');

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

  // Keep this for fast calculations
  score: {
    teamA: { type: Number, required: true },
    teamB: { type: Number, required: true }
  },

  // Players in match
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
    }
  }],

  rounds: [RoundSchema],

  result: {
    winningTeam: {
      type: String,
      enum: ['A', 'B'],
      required: true
    }
  }

});

module.exports = mongoose.model('Match', MatchSchema);