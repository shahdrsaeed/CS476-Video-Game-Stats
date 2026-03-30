const express = require('express');
const router = express.Router();
const { getAllMaps, getMapById } = require('../controllers/mapController');

router.get('/', getAllMaps);
router.get('/:id', getMapById);

module.exports = router;