const express = require('express');
const router = express.Router();
const { getAllMaps, getMapByName } = require('../controllers/mapController');

router.get('/', getAllMaps);
router.get('/name/:name', (req, res, next) => {
    req.params.name = req.params.name .charAt(0).toUpperCase() + req.params.name.slice(1).toLowerCase();
    next();
}, getMapByName);

module.exports = router;