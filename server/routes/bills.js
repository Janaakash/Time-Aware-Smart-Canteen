const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware } = require('../middleware/auth');

router.get('/:billNumber', authMiddleware, billController.getBillByNumber);
router.get('/order/:orderId', authMiddleware, billController.getBillByOrderId);

module.exports = router;
