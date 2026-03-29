const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    sendRequest,
    approveRequest,
    rejectRequest,
    getRequests
 } = require('../controllers/requestController');

router.post('/:coachId/send', sendRequest);
router.put('/:id/approve', approveRequest);
router.delete('/:id/reject', rejectRequest);
router.get('/', auth, getRequests);

module.exports = router;