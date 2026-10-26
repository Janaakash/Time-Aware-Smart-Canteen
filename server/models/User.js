const mongoose = require('mongoose');
const { createHybridModel } = require('./modelHelper');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String }, // Optional for staff/admin
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
}, { timestamps: true });

module.exports = createHybridModel('User', userSchema, 'users');

