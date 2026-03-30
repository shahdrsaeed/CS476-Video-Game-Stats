const express = require('express');
const router = express.Router();
const { getPlayers, assignPlayer, getAggregatedStats, getCoachById } = require('../controllers/coachController');

// Get coach
router.get('/:id', getCoachById);  // ← add this
// Get all players assigned to a coach
router.get('/:id/players', getPlayers);
// Assign a player to a coach
router.post('/:id/assign', assignPlayer);
// Get aggregated stats for a coach's players
router.get('/:id/aggregated-stats', getAggregatedStats);

module.exports = router;