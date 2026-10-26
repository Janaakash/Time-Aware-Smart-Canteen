const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, roleMiddleware(['student']), orderController.placeOrder);
router.get('/my-orders', authMiddleware, roleMiddleware(['student']), orderController.getMyOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
