const mongoose = require('mongoose');

const RoundPlayerSchema = new mongoose.Schema({
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

  // Core stats
  kills: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },

  // Damage (needed for DD delta)
  damageDealt: { type: Number, default: 0 },
  damageTaken: { type: Number, default: 0 },

  // KAST flags (simple + efficient)
  survived: { type: Boolean, default: false },
  traded: { type: Boolean, default: false }

}, { _id: false });

const RoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true
  },

  winningTeam: {
    type: String,
    enum: ['A', 'B'],
    required: true
  },

  players: [RoundPlayerSchema]

}, { _id: false });

module.exports = RoundSchema;