const mongoose = require('mongoose');
const { createHybridModel } = require('./modelHelper');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // URL to image
  prepTime: { type: Number, default: 5 }, // Preparation time in minutes
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = createHybridModel('FoodItem', foodItemSchema, 'foods');

