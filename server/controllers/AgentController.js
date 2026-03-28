// Import Agent model
const Agent = require('../models/submodel/Agent');
 
// Returns a list of all agents with their required fields (name, role, description) along with their image URL
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({}, 'name role description imageURL');
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agents', error: error.message });
  }
};
 
 // Returns the full details of a single agent by name
 // Includes description, abilities, advantages, disadvantages, and difficulty
const getAgentByName = async (req, res) => {
  try {
    // Use a case-insensitive regex so "Phoenix" and "phoenix" both work
    const agent = await Agent.findOne({ 
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } 
    });
 
    if (!agent) {
      return res.status(404).json({ message: `Agent "${req.params.name}" not found` });
    }
 
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agent', error: error.message });
  }
};
 
// Returns all agents that share a given role (e.g. "Duelist", "Controller").
const getAgentsByRole = async (req, res) => {
  try {
    const agents = await Agent.find(
      { role: { $regex: new RegExp(`^${req.params.role}$`, 'i') } },
      'name role difficulty imageURL'
    );
 
    if (agents.length === 0) {
      return res.status(404).json({ message: `No agents found with role "${req.params.role}"` });
    }
 
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agents by role', error: error.message });
  }
};
 
// Export all controller functions
module.exports = {
  getAllAgents,
  getAgentByName,
  getAgentsByRole
};