const FoodItem = require('../models/FoodItem');

exports.getAllFoods = async (req, res) => {
  try {
    const foods = await FoodItem.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching foods.', error: error.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const food = new FoodItem(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error creating food.', error: error.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    const food = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ message: 'Food not found.' });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food.', error: error.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found.' });
    res.json({ message: 'Food deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food.', error: error.message });
  }
};
