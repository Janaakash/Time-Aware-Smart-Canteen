require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const FoodItem = require('./models/FoodItem');
const CanteenConfig = require('./models/CanteenConfig');
const connectDB = require('./config/db');

const foods = [
  { name: 'Idli', category: 'BREAKFAST', price: 30, prepTime: 3, image: 'https://placehold.co/500x300/f97316/ffffff?text=Idli' },
  { name: 'Vada', category: 'BREAKFAST', price: 15, prepTime: 3, image: 'https://placehold.co/500x300/f97316/ffffff?text=Vada' },
  { name: 'Pongal', category: 'BREAKFAST', price: 40, prepTime: 5, image: 'https://placehold.co/500x300/f97316/ffffff?text=Pongal' },
  { name: 'Masala Dosa', category: 'BREAKFAST', price: 50, prepTime: 8, image: 'https://placehold.co/500x300/f97316/ffffff?text=Masala+Dosa' },
  { name: 'Poori Masala', category: 'BREAKFAST', price: 45, prepTime: 6, image: 'https://placehold.co/500x300/f97316/ffffff?text=Poori+Masala' },
  { name: 'Veg Meals', category: 'RICE / MEALS', price: 80, prepTime: 7, image: 'https://placehold.co/500x300/f97316/ffffff?text=Veg+Meals' },
  { name: 'Sambar Rice', category: 'RICE / MEALS', price: 45, prepTime: 4, image: 'https://placehold.co/500x300/f97316/ffffff?text=Sambar+Rice' },
  { name: 'Lemon Rice', category: 'RICE / MEALS', price: 40, prepTime: 4, image: 'https://placehold.co/500x300/f97316/ffffff?text=Lemon+Rice' },
  { name: 'Curd Rice', category: 'RICE / MEALS', price: 35, prepTime: 3, image: 'https://placehold.co/500x300/f97316/ffffff?text=Curd+Rice' },
  { name: 'Chicken Rice', category: 'RICE / MEALS', price: 100, prepTime: 10, image: 'https://placehold.co/500x300/f97316/ffffff?text=Chicken+Rice' },
  { name: 'Chicken Biryani', category: 'RICE / MEALS', price: 120, prepTime: 12, image: 'https://placehold.co/500x300/f97316/ffffff?text=Chicken+Biryani' },
  { name: 'Egg Rice', category: 'RICE / MEALS', price: 80, prepTime: 8, image: 'https://placehold.co/500x300/f97316/ffffff?text=Egg+Rice' },
  { name: 'Samosa', category: 'SNACKS', price: 15, prepTime: 2, image: 'https://placehold.co/500x300/f97316/ffffff?text=Samosa' },
  { name: 'Bajji', category: 'SNACKS', price: 20, prepTime: 4, image: 'https://placehold.co/500x300/f97316/ffffff?text=Bajji' },
  { name: 'Tea', category: 'BEVERAGES', price: 15, prepTime: 2, image: 'https://placehold.co/500x300/f97316/ffffff?text=Tea' },
  { name: 'Coffee', category: 'BEVERAGES', price: 20, prepTime: 2, image: 'https://placehold.co/500x300/f97316/ffffff?text=Coffee' },
  { name: 'Buttermilk', category: 'BEVERAGES', price: 20, prepTime: 1, image: 'https://placehold.co/500x300/f97316/ffffff?text=Buttermilk' }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await FoodItem.deleteMany();
    await CanteenConfig.deleteMany();

    console.log('Cleared existing data.');

    // Users
    const studentPassword = await bcrypt.hash('student123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    const users = [
      { name: 'Akash', email: 'student@example.com', password: studentPassword, role: 'student', studentId: 'STU1001' },
      { name: 'Rahul', email: 'rahul@example.com', password: studentPassword, role: 'student', studentId: 'STU1002' },
      { name: 'Priya', email: 'priya@example.com', password: studentPassword, role: 'student', studentId: 'STU1003' },
      { name: 'Arjun', email: 'arjun@example.com', password: studentPassword, role: 'student', studentId: 'STU1004' },
      { name: 'Karthik', email: 'karthik@example.com', password: studentPassword, role: 'student', studentId: 'STU1005' },
      { name: 'Divya', email: 'divya@example.com', password: studentPassword, role: 'student', studentId: 'STU1006' },
      { name: 'Canteen Staff', email: 'staff@canteen.com', password: staffPassword, role: 'staff' },
      { name: 'Admin', email: 'admin@canteen.com', password: adminPassword, role: 'admin' },
    ];

    await User.insertMany(users);
    console.log('Demo Users seeded.');

    // Foods
    await FoodItem.insertMany(foods);
    console.log('Demo Foods seeded.');

    // Config
    await CanteenConfig.create({
      maxOrdersPerPickupWindow: 5,
      kitchenPrepSlots: 3,
      pickupWindowDurationMins: 10,
      pickupHandlingMins: 1,
      walkingTimeMins: 3,
      eatingTimeMins: 5,
      lowDelayThresholdMins: 5,
      highDelayThresholdMins: 15
    });
    console.log('Default CanteenConfig seeded.');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
