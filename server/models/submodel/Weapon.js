const mongoose = require('mongoose');

// Define the Weapon model in MongoDB
const WeaponSchema = new mongoose.Schema({
  weaponName: {
    type: String,
    required: true, // every weapon must have a name
    unique: true    // no two weapons can share the same name
  },
  weaponType: {     // Ex. sidearm, SMG, shotgun, rifle 
    type: String,
    required: true  // every weapon must have a type
  },
  description: {
    type: String,
    required: true  // every weapon must have a description for the archive
  },
  advantages: [     // is an array since each weapon can have multiple advantages
    { 
        title: { type: String },        // main idea/short descriptor of advantage
        explanation: { type: String }   // explanation of advantage
    } 
  ],
  disadvantages: [  // is an array since each weapon can have multiple disadvantages
    { 
        title: { type: String },        // main idea/short descriptor of disadvantage
        explanation: { type: String }   // explanation of disadvantage
    }
  ],
  imageUrl: {
    type: String    // optional - for displaying image of weapon in the archive
  }
});

// Export model so that other files can use it
module.exports = mongoose.model('Weapon', WeaponSchema);
