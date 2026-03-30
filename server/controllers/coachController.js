const Player = require('../models/Player');
const Coach = require('../models/Coach');
const { calculateACS } = require('../helpers/statsCalculator');

// Get all players assigned to a coach
const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({ coach: req.params.id })
    // added this so that player cards in front end can have the data they need
    .select('-password')
      .populate('teamId', 'teamName')
      // remove since these are no longer in player schema
      // .populate('topAgents.agent', 'name')
      // .populate('topMaps.map', 'name');

    res.status(200).json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign a player to a coach
const assignPlayer = async (req, res) => {
  try {
    const { playerId } = req.body;
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    player.coach = req.params.id;
    await player.save();

    res.status(200).json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get aggregated stats for a coach's players
const getAggregatedStats = async (req, res) => {
  try {
    // Get all players for this coach (MODIFIED TO POPULATE LAST 20 MATCHES)
    const players = await Player.find({ coach: req.params.id })
    .populate({
      path: 'last20Matches.match',
      select: 'rounds players',
    });
    
    // modified this to return zeroed stats if coach does not have team yet
    if (players.length === 0) {
      return res.status(200).json({
        averageKd:          '0.00',
        averageWinRate:     '0.00',
        averageAcs:         '0.00',
        totalMatchesPlayed: 0
      });
    }

    // Initialize accumulators
    let totalKd = 0;
    let totalWinRate = 0;
    let totalAcs = 0;
    let totalMatches = 0;

    players.forEach(player => {
      totalKd += parseFloat(player.kdRatio);
      totalWinRate += parseFloat(player.winRate);
      // Calculate ACS for each player using the helper function
      totalAcs += parseFloat(calculateACS(player));
      totalMatches += player.matchesPlayed;
    });

    const aggregatedStats = {
      averageKd: (totalKd / players.length).toFixed(2),
      averageWinRate: (totalWinRate / players.length).toFixed(2),
      averageAcs: (totalAcs / players.length).toFixed(2),
      totalMatchesPlayed: totalMatches
    };

    res.status(200).json(aggregatedStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// added a get coach function
const getCoachById = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .select('-password')
      .populate('teamId', 'teamName');  // populate team name here

    if (!coach) return res.status(404).json({ message: 'Coach not found' });

    res.json(coach.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    getPlayers,
    assignPlayer,
    getAggregatedStats,
    getCoachById  // ← add this
}
