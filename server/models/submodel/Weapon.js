const mongoose = require('mongoose');

// Define the Weapon model in MongoDB
const WeaponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // every weapon must have a name
    unique: true    // no two weapons can share the same name
  },
  type: {           // Ex. sidearm, SMG, shotgun, rifle 
    type: String,
    required: true  // every weapon must have a type
  },
  description: {
    type: String,
    required: true  // every weapon must have a description for the archive
  },
  fireMode: {       // Ex. automatic, semi-automatic, burst
    type: String,
  },
  rateOfFire: {     // rounds per second
    type: Number,
    min: 0
  },
  magazineCapacity: { // number of rounds per magazine
    type: Number,
    min: 0
  },
  wallPenetration: { // how well the weapon penetrates surfaces
    type: String,
    enum: ['Low', 'Medium', 'High']
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
    type: String    // for displaying image of weapon in the archive
  }
});

// Export model so that other files can use it
module.exports = mongoose.model('Weapon', WeaponSchema);