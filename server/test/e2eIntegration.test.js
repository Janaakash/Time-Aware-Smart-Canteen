const assert = require('assert');
const path = require('path');

// Ensure env loaded
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const CanteenConfig = require('../models/CanteenConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function runE2ETests() {
  console.log('--- Starting Comprehensive Full-Stack E2E Verification ---');
  await connectDB();

  // Test 1: Config
  let config = await CanteenConfig.findOne();
  if (!config) {
    config = await CanteenConfig.create({
      maxOrdersPerPickupWindow: 5,
      kitchenPrepSlots: 3,
      pickupWindowDurationMins: 10,
      pickupHandlingMins: 1,
      walkingTimeMins: 3,
      eatingTimeMins: 5
    });
  }
  assert.ok(config, 'CanteenConfig should exist');
  console.log('✓ Test 1 Passed: CanteenConfig verified');

  // Test 2: User auth & JWT
  const testEmail = `test_${Date.now()}@canteen.test`;
  const hashedPassword = await bcrypt.hash('secret123', 10);
  const user = new User({
    name: 'E2E Tester',
    email: testEmail,
    password: hashedPassword,
    role: 'student',
    studentId: 'TEST999'
  });
  await user.save();

  const foundUser = await User.findOne({ email: testEmail });
  assert.strictEqual(foundUser.name, 'E2E Tester');

  const jwtSecret = process.env.JWT_SECRET || 'supersecretcanteenkey';
  const token = jwt.sign(
    { userId: foundUser._id, role: foundUser.role, name: foundUser.name },
    jwtSecret,
    { expiresIn: '1h' }
  );
  const decoded = jwt.verify(token, jwtSecret);
  assert.strictEqual(decoded.name, 'E2E Tester');
  console.log('✓ Test 2 Passed: User creation, hashing & JWT signing/verification');

  // Test 3: Food Items
  const foods = await FoodItem.find();
  assert.ok(foods.length > 0, 'Should have food items');
  const sampleFood = foods[0];
  console.log(`✓ Test 3 Passed: Found ${foods.length} food items (sample: ${sampleFood.name})`);

  // Test 4: Order Creation & Billing
  const orderNumber = `ORD_TEST_${Date.now()}`;
  const billNumber = `B_TEST_${Date.now()}`;
  const order = new Order({
    orderNumber,
    billNumber,
    studentId: foundUser._id,
    items: [{
      foodItemId: sampleFood._id,
      foodName: sampleFood.name,
      quantity: 2,
      price: sampleFood.price,
      itemStatus: 'PREPARING'
    }],
    subtotal: sampleFood.price * 2,
    totalAmount: sampleFood.price * 2,
    status: 'PREPARING',
    paymentStatus: 'SUCCESSFUL',
    paymentMethod: 'Google Pay',
    transactionId: `TXN_${Date.now()}`,
    paidAmount: sampleFood.price * 2,
    paidAt: new Date(),
    estimatedPrepTime: sampleFood.prepTime || 5,
    estimatedTotalTime: 8,
    estimatedReadyAt: new Date(Date.now() + 8 * 60000)
  });
  await order.save();

  const bill = new Bill({
    billNumber,
    orderId: order._id,
    studentId: foundUser._id,
    amount: order.totalAmount,
    paymentStatus: 'SUCCESSFUL'
  });
  await bill.save();
  console.log('✓ Test 4 Passed: Order and Bill created and saved');

  // Test 5: Bill and Order population
  const fetchedBill = await Bill.findOne({ billNumber }).populate({
    path: 'orderId',
    populate: { path: 'studentId', select: 'name' }
  });
  assert.ok(fetchedBill, 'Bill should be found');
  assert.strictEqual(fetchedBill.amount, order.totalAmount);
  console.log('✓ Test 5 Passed: Bill populated successfully');

  // Test 6: Notification creation & fetch
  const notif = new Notification({
    studentId: foundUser._id,
    orderId: order._id,
    billNumber,
    message: 'Food ready for pickup',
    type: 'FOOD_READY'
  });
  await notif.save();

  const notifs = await Notification.find({ studentId: foundUser._id });
  assert.ok(notifs.length >= 1, 'Notification should be retrieved');
  console.log('✓ Test 6 Passed: Notification pipeline verified');

  console.log('====================================================');
  console.log('🎉 ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});

