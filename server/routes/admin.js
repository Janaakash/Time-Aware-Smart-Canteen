const express = require('express');
const router = express.Router();
const adminConfigController = require('../controllers/adminConfigController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/config', authMiddleware, roleMiddleware(['staff', 'admin']), adminConfigController.getAdminConfig);
router.put('/config', authMiddleware, roleMiddleware(['admin']), adminConfigController.updateAdminConfig);

module.exports = router;
