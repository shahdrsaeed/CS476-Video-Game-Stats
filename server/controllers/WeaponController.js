// Import Weapon model
const Weapon = require('../models/submodel/Weapon');

// Returns a list of all weapons with their required fields (name, type, description) along with a image URL
const getAllWeapons = async (req, res) => {
  try {
    const weapons = await Weapon.find({}, 'name type description imageUrl');
    res.status(200).json(weapons);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving weapons', error: error.message });
  }
};
 
// Returns the full details of a single weapon by name
// Includes description, stats, fire mode, advantages, disadvantages, etc.
const getWeaponByName = async (req, res) => {
  try {
    const weapon = await Weapon.findOne({ 
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } 
    });
 
    if (!weapon) {
      return res.status(404).json({ message: `Weapon "${req.params.name}" not found` });
    }
 
    res.status(200).json(weapon);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving weapon', error: error.message });
  }
};

// Returns all weapons of a given type (e.g. "Rifle", "Shotgun", "Sidearm").
const getWeaponsByType = async (req, res) => {
  try {
    const weapons = await Weapon.find(
      { type: { $regex: new RegExp(`^${req.params.type}$`, 'i') } },
      'name type fireMode imageUrl'
    );
 
    if (weapons.length === 0) {
      return res.status(404).json({ message: `No weapons found with type "${req.params.type}"` });
    }
 
    res.status(200).json(weapons);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving weapons by type', error: error.message });
  }
};

// Export all controller functions
module.exports = {
  getAllWeapons,
  getWeaponByName,
  getWeaponsByType
};
