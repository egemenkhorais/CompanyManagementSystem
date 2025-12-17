const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.patch('/:id/status', authMiddleware, meetingController.updateMeetingStatus);

router.get('/', authMiddleware, meetingController.getMeetings);
router.get('/department/:departmentId', meetingController.getMeetingsByDepartment);

router.post('/', authMiddleware, meetingController.createMeeting);

router.put('/:id', authMiddleware, meetingController.updateMeeting);

router.delete('/:id', authMiddleware, meetingController.deleteMeeting);

module.exports = router;