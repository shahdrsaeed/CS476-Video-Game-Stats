const Map = require('../models/submodel/Map');

/**
 * GET all maps
 * @route
 * @returns {Array}
 */
const getAllMaps = async (req, res) => {
    try {
        const maps = await Map.find().select('__v');
        res.status(200).json({ success: true, data: maps });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * GET mapByName
 * @route
 * @returns {Object}
 */
const getMapById = async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);

        if (!map) return res.status(404).json({ success: false, error: 'Map not found' });

        res.status(200).json({ success: true, data: map });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getAllMaps, getMapById };