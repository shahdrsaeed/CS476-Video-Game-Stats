const mongoose = require('mongoose');
const User = require('./User');

const PlayerSchema = new mongoose.Schema({
  coach: { // required reference to a coach
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    default: null,
    index: true
  },

  rank: { // rank of the player
    type: String,
    required: true,
    default: 'Unranked',
    enum: [
      'Unranked',
      'Iron I', 'Iron II', 'Iron III',
      'Bronze I', 'Bronze II', 'Bronze III',
      'Silver I', 'Silver II', 'Silver III',
      'Gold I', 'Gold II', 'Gold III',
      'Platinum I', 'Platinum II', 'Platinum III',
      'Diamond I', 'Diamond II', 'Diamond III',
      'Ascendant I', 'Ascendant II', 'Ascendant III',
      'Immortal I', 'Immortal II', 'Immortal III',
      'Radiant'
    ],
    index: true
  },

  rr: { // current rank rating (RR) of the player
    type: Number,
    default: 0,
    required: true,
    min: 0
  },

  level: { // level of player account
    type: Number,
    default: 1,
    required: true,
    min: 1
  },

  stats: { // dto for player stats
    kills: { type: Number, default: 0, min: 0 },
    deaths: { type: Number, default: 0, min: 0 },
    assists: { type: Number, default: 0, min: 0 },

    roundsPlayed: { type: Number, default: 0, min: 0 },

    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },

    firstBloods: { type: Number, default: 0, min: 0 },
    firstDeaths: { type: Number, default: 0, min: 0 },
    aces: { type: Number, default: 0, min: 0 },
    flawlessRounds: { type: Number, default: 0, min: 0 },

    damageDealt: { type: Number, default: 0, min: 0 },
    damageTaken: { type: Number, default: 0, min: 0 },
    
    headshots: { type: Number, default: 0, min: 0 },
    bodyshots: { type: Number, default: 0, min: 0 },
    legshots: { type: Number, default: 0, min: 0 },
  },

  topWeapons: [{ // top 3 weapons for the player with stats
    weapon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Weapon',
      required: true
    },
    totalKills: { type: Number, default: 0, min: 0 },
    headshotKills: { type: Number, default: 0, min: 0 },
    bodyshotKills: { type: Number, default: 0, min: 0 },
    legshotKills: { type: Number, default: 0, min: 0 }
  }],

  topAgents: [{ // top 3 agents used for the player with stats
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    matchesPlayed: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    kills: { type: Number, default: 0, min: 0 },
    deaths: { type: Number, default: 0, min: 0 },
    assists: { type: Number, default: 0, min: 0 }
  }],

  last20Matches: [{  // review of last 20 matches
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true
    },
    result: {
      type: String,
      enum: ['Win', 'Loss'],
      required: true
    }
  }],

  topMaps: [{ // top 3 maps for the player, sorted by highest win rate
    map: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Map',
      required: true
    },
    matchesPlayed: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 }
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


/* Virtuals derived from stats */

// Total matches played
PlayerSchema.virtual('matchesPlayed').get(function () {
  return this.stats.wins + this.stats.losses;
});

// K/D ratio
PlayerSchema.virtual('kdRatio').get(function () {
  if (this.stats.deaths === 0)
    return this.stats.kills.toFixed(2);
  return (this.stats.kills / this.stats.deaths).toFixed(2);
});

// (K+A)/D ratio
PlayerSchema.virtual('kadRatio').get(function () {
  const { kills, assists, deaths } = this.stats;

  if (deaths === 0) return (kills + assists).toFixed(2);

  return ((kills + assists) / deaths).toFixed(2);
});

// Win rate percentage
PlayerSchema.virtual('winRate').get(function () {
  const total = this.stats.wins + this.stats.losses;
  if (total === 0) return '0.00';
  return ((this.stats.wins / total) * 100).toFixed(2);
});

// ACS
PlayerSchema.virtual('acs').get(function () {
  if (this.stats.roundsPlayed === 0) return '0.00';
  return (this.stats.damageDealt / this.stats.roundsPlayed).toFixed(2);
})

// Headshot percentage
PlayerSchema.virtual('headshotPercentage').get(function () {
  const totalHits = this.stats.headshots + this.stats.bodyshots + this.stats.legshots;
  if (totalHits === 0) return '0.00';
  return ((this.stats.headshots / totalHits) * 100).toFixed(2);
});

// Bodyshot percentage
PlayerSchema.virtual('bodyshotPercentage').get(function () {
  const totalHits = this.stats.headshots + this.stats.bodyshots + this.stats.legshots;
  if (totalHits === 0) return '0.00';
  return ((this.stats.bodyshots / totalHits) * 100).toFixed(2);
});

// Legshot percentage
PlayerSchema.virtual('legshotPercentage').get(function () {
  const totalHits = this.stats.headshots + this.stats.bodyshots + this.stats.legshots;
  if (totalHits === 0) return '0.00';
  return ((this.stats.legshots / totalHits) * 100).toFixed(2);
});


//  Method to add a match to last20Matches
PlayerSchema.methods.addMatch = function (matchData) {
  this.last20Matches.unshift(matchData);

  if (this.last20Matches.length > 20) {
    this.last20Matches.pop();
  }
};


// Indexes for efficient querying
PlayerSchema.index({ 'stats.kills': -1 });
PlayerSchema.index({ 'stats.wins': -1 });


// Create Player as discriminator
const Player = User.discriminator('Player', PlayerSchema);

module.exports = Player;