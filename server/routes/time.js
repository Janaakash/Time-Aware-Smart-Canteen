const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');

router.get('/queue-status', timeController.getQueueStatus);
router.get('/recommendations', timeController.getRecommendations);
router.get('/pickup-windows', timeController.getPickupWindows);
router.get('/config', timeController.getConfig);

module.exports = router;
