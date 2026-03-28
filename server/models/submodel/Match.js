// Import Mongoose library
const mongoose = require('mongoose');
const RoundSchema = require('./Round');

// stats sub-schema
const StatSchema = new mongoose.Schema({
  kills: { type: Number, default: 0, min: 0, required: true },
  deaths: { type: Number, default: 0, min: 0, required: true },
  assists: { type: Number, default: 0, min: 0, required: true },

  damageDealt: { type: Number, default: 0, min: 0, required: true}, // damageDealt across all rounds
  damageTaken: { type: Number, default: 0, min: 0, required: true},

  headshots: { type: Number, default: 0, min: 0, required: true},
  bodyshots: { type: Number, default: 0, min: 0, required: true},
  legshots: { type: Number, default: 0, min: 0, required: true},

  firstBloods: { type: Number, default: 0, min: 0, required: true},
  firstDeaths: {type: Number, default: 0, min: 0, required: true},
  aces: { type: Number, default: 0, min: 0, required: true},
  flawlessRounds: { type: Number, default: 0, min: 0, required: true}
})

/* Virtuals derived from stats */

// Virtual for totalHits
StatSchema.virtual('totalHits').get(function () {
  return (this.headshots) + (this.bodyshots) + (this.legshots);
})

// JSON/output virtual
StatSchema.set('toJSON', { virtuals: true });
StatSchema.set('toObject', { virtuals: true });

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
    teamA: { type: Number, default: 0, min: 0, required: true },
    teamB: { type: Number, default: 0, min: 0, required: true }
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
      },
  
      stats: StatSchema
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