const Order = require('../models/Order');
const Bill = require('../models/Bill');

const generateUniqueId = (prefix) => {
  return `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
};

const timeService = require('../services/timeService');
const FoodItem = require('../models/FoodItem');

exports.placeOrder = async (req, res) => {
  try {
    const { items, subtotal, totalAmount, paymentStatus, paymentMethod, transactionId, pickupWindow } = req.body;
    const studentId = req.user.userId;

    if (paymentStatus !== 'SUCCESSFUL') {
      return res.status(400).json({ message: 'Order can only be placed after successful payment.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required.' });
    }

    // Verify item availability server-side
    const itemIds = items.map(i => i.foodItemId);
    const dbFoods = await FoodItem.find({ _id: { $in: itemIds } });
    const foodMap = new Map(dbFoods.map(f => [f._id.toString(), f]));

    for (const item of items) {
      const dbFood = foodMap.get(item.foodItemId.toString());
      if (!dbFood || !dbFood.available) {
        return res.status(400).json({ message: `Item "${item.foodName || 'Food'}" is unavailable.` });
      }
    }

    // Capacity verification for pickup window if specified
    if (pickupWindow && pickupWindow.slotLabel) {
      const config = await timeService.getConfig();
      const existingCount = await Order.countDocuments({
        'pickupWindow.slotLabel': pickupWindow.slotLabel,
        status: { $in: ['ORDER PLACED', 'PAYMENT CONFIRMED', 'PREPARING', 'FOOD PREPARED'] }
      });
      if (existingCount >= config.maxOrdersPerPickupWindow) {
        return res.status(400).json({ 
          message: `Pickup window ${pickupWindow.slotLabel} is full. Please choose a different pickup window.` 
        });
      }
    }

    // Calculate prep times & queue estimates
    const queueInfo = await timeService.getQueueEstimation();
    const maxItemPrepTime = items.reduce((max, item) => {
      const dbFood = foodMap.get(item.foodItemId.toString());
      const prep = dbFood ? (dbFood.prepTime || 5) : 5;
      return Math.max(max, prep);
    }, 5);

    const estimatedQueueDelay = queueInfo.estimatedQueueDelay;
    const estimatedPrepTime = maxItemPrepTime;
    const config = await timeService.getConfig();
    const estimatedTotalTime = estimatedQueueDelay + estimatedPrepTime + (config.pickupHandlingMins || 1);

    const now = new Date();
    const estimatedReadyAt = new Date(now.getTime() + estimatedTotalTime * 60000);

    const orderNumber = generateUniqueId('ORD');
    const billNumber = generateUniqueId('B');

    const order = new Order({
      orderNumber,
      billNumber,
      studentId,
      items: items.map(item => ({ ...item, itemStatus: 'PREPARING' })),
      subtotal,
      totalAmount,
      status: 'PREPARING',
      paymentStatus: 'SUCCESSFUL',
      paymentMethod,
      transactionId,
      paidAmount: totalAmount,
      paidAt: now,
      actualPrepStartTime: now,
      pickupWindow: pickupWindow || null,
      estimatedPrepTime,
      estimatedQueueDelay,
      estimatedTotalTime,
      estimatedReadyAt
    });

    await order.save();

    const bill = new Bill({
      billNumber,
      orderId: order._id,
      studentId,
      amount: totalAmount,
      paymentStatus: 'SUCCESSFUL'
    });

    await bill.save();

    res.status(201).json({ message: 'Order placed successfully', order, bill });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order.', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order.', error: error.message });
  }
};
