const Request = require('../models/Request');
const Player = require('../models/Player');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');

const sendRequest = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const coachId = decoded.id;

    const { playerId, teamId } = req.body;

    const request = new Request({
      player: playerId,
      team: teamId,
      coach: coachId,  // assign coach from token
      status: 'Pending'
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

    // Approve a request to join a team
const approveRequest = async (req, res) => {
    try{
        const request = await Request.findById(req.params.id);
        if (!request){
            return res.status(404).json({ message: 'Request not found' });
        }
        
        request.status = 'Approved';
        await request.save();

        // Assign player to coach and team
        await Player.findByIdAndUpdate(request.player, {
            coach: request.coach,
            teamId: request.team
        });

        // Add player to team's players array if not already there
        await Team.findByIdAndUpdate(request.team, {
        $addToSet: { players: request.player }
        });

        res.status(200).json({ message: 'Request approved', request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject a request to join a team
const rejectRequest = async (req, res) => {
    try{
        const request = await Request.findById(req.params.id);
        if (!request) {
        return res.status(404).json({ message: 'Request not found' });
        }

        await Request.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all requests (optionally filter by coach or team)
const getRequests = async (req, res) => {
    try {
        const { coachId, teamId } = req.query;
        let query = {};

        if (coachId) query.coach = coachId;
        if (teamId) query.team = teamId;

        const requests = await Request.find(query)
            .populate('player', 'username')
            .populate('team', 'teamName')
            .populate('coach', 'username');

        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    sendRequest,
    approveRequest,
    rejectRequest,
    getRequests
};