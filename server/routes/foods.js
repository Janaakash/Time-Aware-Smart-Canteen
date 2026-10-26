const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', foodController.getAllFoods);
router.post('/', authMiddleware, roleMiddleware(['admin']), foodController.createFood);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), foodController.updateFood);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), foodController.deleteFood);

module.exports = router;
