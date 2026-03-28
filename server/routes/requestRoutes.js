const express = require('express');
const router = express.Router();
const { 
    sendRequest,
    approveRequest,
    rejectRequest,
    getRequests
 } = require('../controllers/requestController');

router.post('/:coachId/send', sendRequest);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);
router.get('/', getRequests);

module.exports = router;