const Player = require('../models/Player');
const { calculateACS } = require('../helpers/statsCalculator');

// Get all players assigned to a coach
const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({ coach: req.params.id });
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
    // Get all players for this coach
    const players = await Player.find({ coach: req.params.id });

    if (players.length === 0) {
      return res.status(404).json({ message: 'No players found for this coach' });
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

module.exports = {
    getPlayers,
    assignPlayer,
    getAggregatedStats
}
