const Player = require('../models/Player');

const {
  calculateRoundWinPercentage,
  calculateKAST,
  calculateDDDeltaPerRound,
  calculateACS,             // added this
  calculateKillsPerRound,   // ← add
  calculateDamagePerRound,  // ← add
  calculateACS,
  calculateTopAgents,
  calculateTopMaps,
  calculateTopWeapons
} = require('../helpers/statsCalculator');

// Get player stats - this would be used to retrieve a player's stats for display on the frontend
/*
const getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate last 20 matches with rounds and players for calculations
    const player = await Player.findById(id)
      .populate({
        path: 'last20Matches.match',
        select: 'rounds players map',
        populate: {
          path: 'players.agent players.weapon map'
        }
      });

    if (!player) return res.status(404).json({ message: 'Player not found' });

    // Calculate advanced stats
    const roundWinPercentage = calculateRoundWinPercentage(player);
    const kast = calculateKAST(player);
    const ddDeltaPerRound = calculateDDDeltaPerRound(player);
    const acs = calculateACS(player);

    // Return player data along with calculated stats in json response
    return res.json({
      player,
      roundWinPercentage,
      kast,
      ddDeltaPerRound,
      acs,
      topAgents: calculateTopAgents(player),
      topMaps: calculateTopMaps(player),
      topWeapons: calculateTopWeapons(player)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
*/
const getPlayerStats = async (req, res) => { // modified function to get necessary data for front end and merge computed stats into a player object
  try {
    const { id } = req.params;

    const player = await Player.findById(id)
      .select('-password')
      .populate('teamId', 'teamName')          // ← add this line
      .populate({
        path: 'last20Matches.match',
        select: 'rounds players score map datePlayed result',
        populate: { path: 'map', select: 'name' }
      })
      .populate('topAgents.agent', 'name')
      .populate('topWeapons.weapon', 'name type')
      .populate('topMaps.map', 'name');

    if (!player) return res.status(404).json({ message: 'Player not found' });

    const roundWinPercentage = calculateRoundWinPercentage(player);
    const kast = calculateKAST(player);
    const ddDeltaPerRound = calculateDDDeltaPerRound(player);
    const acs = calculateACS(player);
    const killsPerRound = calculateKillsPerRound(player);   // ← add
    const damagePerRound = calculateDamagePerRound(player); // ← add

    // Merge computed stats into the player object
    const playerObj = player.toObject();
    delete playerObj.password;

    return res.json({
      ...playerObj,
      roundWinPercentage,
      kast,
      ddDeltaPerRound,
      acs,
      killsPerRound,   // ← add
      damagePerRound  // ← add
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get player by ID - this would be used to retrieve a player's profile and stats for display on the frontend
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .select('-password');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json(player);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update player stats - this would be called after a match is completed to update the player's stats based on the match results
const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // runValidator enforces enum
    );

    res.json(updatedPlayer);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all players - for team search (MODIFIED FUNCTION to add more data for frontend)
const getAllPlayers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }

    const players = await Player.find(query)
      .select('-password')
      .populate('teamId', 'teamName')        // ← add this
      .populate('topAgents.agent', 'name')   // ← add this for modal
      .populate('topMaps.map', 'name');      // ← add this for modal

    res.json(players);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPlayerStats,
  getPlayerById,
  updatePlayer,
  getAllPlayers,
};