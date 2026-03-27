const Player = require('../models/Player');
const Match = require('../models/submodel/Match');
const {
  calculateRoundWinPercentage,
  calculateKAST,
  calculateDDDeltaPerRound
} = require('../helpers/statsCalculator');

const getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate last 20 matches with rounds and players for calculations
    const player = await Player.findById(id)
      .populate({
        path: 'last20Matches.match',
        select: 'rounds players',
      });

    if (!player) return res.status(404).json({ message: 'Player not found' });

    // Calculate advanced stats
    const roundWinPercentage = calculateRoundWinPercentage(player);
    const kast = calculateKAST(player);
    const ddDeltaPerRound = calculateDDDeltaPerRound(player);

    // Return player data along with calculated stats in json response
    return res.json({
      player,
      roundWinPercentage,
      kast,
      ddDeltaPerRound
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPlayerStats
};