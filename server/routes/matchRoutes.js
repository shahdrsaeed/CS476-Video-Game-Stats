const express = require('express');
const router = express.Router();
const { createMatch, getMatch } = require('../controllers/matchController');

router.post('/', createMatch);
router.post('/:id', getMatch);

module.exports = router;