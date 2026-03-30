const express = require('express');
const router = express.Router();
const { 
    getPlayerStats,
    getPlayerById,
    updatePlayer,
    getAllPlayers
} = require('../controllers/playerController');

router.get('/', getAllPlayers); 
router.get('/:id/stats', getPlayerStats);
router.get('/:id/', getPlayerById);
router.put('/:id', updatePlayer);

module.exports = router;