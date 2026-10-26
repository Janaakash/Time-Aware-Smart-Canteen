const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/orders', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.getOrders);
router.get('/summary', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.getDashboardSummary);
router.get('/orders/bill/:billNumber', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.getOrderByBillNumber);
router.patch('/orders/:id/items/:itemId/ready', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.prepareOrderItem);
router.patch('/orders/:id/delay', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.flagOrderDelay);
router.patch('/orders/:id/collect', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.markOrderCollected);

module.exports = router;
