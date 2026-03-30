const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Player = require('../models/Player');

// GET /api/teams/:id — get team info
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/:id/players — get all players on a team with full stats
// BUG 5 FIX: CoachDashboardView calls this to get real roster instead of mock data
router.get('/:id/players', async (req, res) => {
  try {
    const players = await Player.find({ teamId: req.params.id });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
