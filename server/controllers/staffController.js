const Order = require('../models/Order');
const Notification = require('../models/Notification');
const timeService = require('../services/timeService');
const { getIo } = require('../socket/socketHandler');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'COLLECTED' } })
      .populate('studentId', 'name studentId email')
      .sort({ isAtRisk: -1, 'pickupWindow.startTime': 1, createdAt: 1 });

    const now = new Date();
    // Check overdue/at-risk status dynamically
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (order.status !== 'FOOD PREPARED' && order.status !== 'COLLECTED' && order.estimatedReadyAt) {
        if (now > new Date(order.estimatedReadyAt)) {
          orderObj.isAtRisk = true;
          orderObj.delayReason = 'Exceeded estimated ready time';
        }
      }
      return orderObj;
    });

    res.json(processedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.', error: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const activeOrders = await Order.find({ status: { $ne: 'COLLECTED' } });
    const queueInfo = await timeService.getQueueEstimation();
    
    const now = new Date();
    const pendingCount = activeOrders.filter(o => o.status === 'ORDER PLACED' || o.status === 'PAYMENT CONFIRMED').length;
    const preparingCount = activeOrders.filter(o => o.status === 'PREPARING').length;
    const readyCount = activeOrders.filter(o => o.status === 'FOOD PREPARED').length;
    
    const atRiskCount = activeOrders.filter(o => {
      if (o.status === 'FOOD PREPARED') return false;
      return o.isAtRisk || (o.estimatedReadyAt && now > new Date(o.estimatedReadyAt));
    }).length;

    const upcomingCommitments = activeOrders.filter(o => o.pickupWindow && o.pickupWindow.slotLabel).length;

    res.json({
      pendingCount,
      preparingCount,
      readyCount,
      atRiskCount,
      upcomingCommitments,
      totalActiveOrders: activeOrders.length,
      estimatedQueueDelayMins: queueInfo.estimatedQueueDelay,
      workloadLabel: queueInfo.delayLabel,
      workloadClass: queueInfo.delayClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard summary.', error: error.message });
  }
};

exports.getOrderByBillNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const order = await Order.findOne({ billNumber }).populate('studentId', 'name studentId');
    if (!order) return res.status(404).json({ message: 'Bill Number not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill.', error: error.message });
  }
};

exports.prepareOrderItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    
    item.itemStatus = 'READY';
    
    // Check if all items are ready
    const allReady = order.items.every(i => i.itemStatus === 'READY');
    if (allReady) {
      order.status = 'FOOD PREPARED';
      order.preparedAt = new Date();
      order.isAtRisk = false;
      
      // Create notification
      const notification = new Notification({
        studentId: order.studentId,
        orderId: order._id,
        billNumber: order.billNumber,
        message: `🔔 YOUR FOOD IS PREPARED! Your order ${order.billNumber} is ready for pickup. Please collect your food from the canteen.`,
        type: 'FOOD_READY'
      });
      await notification.save();

      // Emit real-time socket event
      const io = getIo();
      if (io) {
        io.to(order.studentId.toString()).emit('notification', notification);
        io.to(order.studentId.toString()).emit('orderUpdated', order);
      }
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item.', error: error.message });
  }
};

exports.flagOrderDelay = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalMins, reason } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.isAtRisk = true;
    order.delayReason = reason || 'High kitchen workload delay';
    
    if (additionalMins && order.estimatedReadyAt) {
      order.estimatedReadyAt = new Date(new Date(order.estimatedReadyAt).getTime() + additionalMins * 60000);
    }
    
    await order.save();

    // Create notification for student
    const notification = new Notification({
      studentId: order.studentId,
      orderId: order._id,
      billNumber: order.billNumber,
      message: `⏳ ORDER UPDATE: Your order ${order.billNumber} is slightly delayed due to kitchen workload. New estimated ready time: ${new Date(order.estimatedReadyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'ORDER_DELAYED'
    });
    await notification.save();

    const io = getIo();
    if (io) {
      io.to(order.studentId.toString()).emit('notification', notification);
      io.to(order.studentId.toString()).emit('orderUpdated', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delay status.', error: error.message });
  }
};

exports.markOrderCollected = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.status !== 'FOOD PREPARED') {
      return res.status(400).json({ message: 'Food is not prepared yet.' });
    }

    order.status = 'COLLECTED';
    order.collectedAt = new Date();
    await order.save();

    const io = getIo();
    if (io) {
      io.to(order.studentId.toString()).emit('orderUpdated', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error collecting order.', error: error.message });
  }
};
