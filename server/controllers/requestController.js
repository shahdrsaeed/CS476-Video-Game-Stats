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

    // BUG 4 FIX: check by coach+player only, ignore teamId
    // Also only block if Pending — allow re-request after Rejection
    const existing = await Request.findOne({
      player: playerId,
      coach: coachId,
      status: 'Pending',
    });
    if (existing) {
      return res.status(409).json({ message: 'Request already sent to this player' });
    }

    const request = new Request({
      player: playerId,
      team: teamId,
      coach: coachId,
      status: 'Pending',
    });

    await request.save();

    await request.populate('player', 'username rank rr imageURL kdRatio winRate headshotPercentage stats');
    await request.populate('team', 'teamName');
    await request.populate('coach', 'username');

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Approved';
    await request.save();

    // BUG 5 FIX: assign player to the coach's team so CoachDashboard fetch works
    await Player.findByIdAndUpdate(request.player, {
      coach: request.coach,
      teamId: request.team,
    });

    await Team.findByIdAndUpdate(request.team, {
      $addToSet: { players: request.player },
    });

    res.status(200).json({ message: 'Request approved', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Used for both coach cancelling AND player declining
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Set Rejected so history is preserved for both sides
    request.status = 'Rejected';
    await request.save();

    res.status(200).json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supports ?coachId=, ?teamId=, ?playerId= filters
const getRequests = async (req, res) => {
  try {
    const { coachId, teamId, playerId } = req.query;
    let query = {};

    if (coachId) query.coach = coachId;
    if (teamId) query.team = teamId;
    if (playerId) query.player = playerId;

    const requests = await Request.find(query)
      .populate('player', 'username rank rr imageURL kdRatio winRate headshotPercentage stats')
      .populate('team', 'teamName')
      .populate('coach', 'username teamId')
      .sort({ date: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendRequest, approveRequest, rejectRequest, getRequests };
