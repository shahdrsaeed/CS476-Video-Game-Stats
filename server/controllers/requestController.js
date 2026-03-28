const Request = require('../models/Request');
const Player = require('../models/Player');

// Send a request to join a team
const sendRequest = async (req, res) => {
    try {
        const { playerId, teamId } = req.body;

        const request = new Request({
            player: playerId,
            team: teamId,
            coach: null, // Coach will be assigned when the request is approved
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

        await Player.findByIdAndUpdate(request.player, { 
            coach: request.coach,
            team: request.team 
        });

        res.status(200).json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject a request to join a team
const rejectRequest = async (req, res) => {
    try{
        const request = await Request.findById(req.params.id);
        res.json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all requests for a team
const getRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('player', 'username')
            .populate('team', 'name')
            .populate('coach', 'username')

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