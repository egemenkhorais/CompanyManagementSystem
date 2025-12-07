const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, meetingController.getMeetings);
router.post('/', authMiddleware, meetingController.createMeeting);
router.put('/:id', authMiddleware, meetingController.updateMeeting);
router.delete('/:id', authMiddleware, meetingController.deleteMeeting);
router.patch('/:id/status', authMiddleware, meetingController.updateStatus);

module.exports = router;