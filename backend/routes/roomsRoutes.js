const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, roomsController.getRooms);
router.post('/', authMiddleware, roomsController.createRoom);
router.put('/:id', authMiddleware, roomsController.updateRoom);
router.delete('/:id', authMiddleware, roomsController.deleteRoom);

module.exports = router;