const express = require('express');
const router = express.Router();
const { getPlayerStats } = require('../controllers/playerController');

router.get('/:id/stats', getPlayerStats);

module.exports = router;