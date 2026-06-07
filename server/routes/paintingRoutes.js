const express = require('express');
const router = express.Router();
const paintingController = require('../controllers/paintingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', paintingController.getAllPaintings);
router.get('/:id', paintingController.getPaintingById);
router.post('/:id/like', authMiddleware, paintingController.toggleLike);

module.exports = router;
