const express = require('express');
const router = express.Router();
const { createMatch, getMatch, applyMatchToPlayers, simulateMatch } = require('../controllers/matchController');

router.post('/', createMatch);
router.post('/:id', getMatch);
router.post('/:id/apply', applyMatchToPlayers);
router.put('/:id/simulate-match', simulateMatch);

module.exports = router;