const mongoose = require('mongoose');

// Define the Agent model in MongoDB
const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // every agent must have a name
    unique: true    // no two agents can share the same name
  },
  role: {
    type: String,
    required: true  // every agent must have a role
  },
  description: {
    type: String,
    required: true  // every agent must have a description for the archive
  },
  advantages: [     // is an array since each agent can have multiple advantages
    { 
        title: { type: String },        // main idea/short descriptor of advantage
        explanation: { type: String }   // explanation of advantage
    } 
  ],
  disadvantages: [  // is an array since each agent can have multiple disadvantages
    { 
        title: { type: String },        // main idea/short descriptor of disadvantage
        explanation: { type: String }   // explanation of disadvantage
    }
  ],
  abilities: [      // is an array since each agent has multiple abilities
    {
      name: { type: String },           // name of ability
      description: { type: String }     // description of what the ability does
    }
  ],
  difficulty: {     // used to describe how difficult the agent is to play/learn 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard']   
  },
  imageURL: {
    type: String    // for displaying image of agent in the archive
  }
});

// Export model so that other files can use it
module.exports = mongoose.model('Agent', AgentSchema);

