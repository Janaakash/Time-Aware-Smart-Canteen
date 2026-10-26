const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const CanteenConfig = require('../models/CanteenConfig');

// Helper to get or create configuration with defaults
async function getConfig() {
  let config = await CanteenConfig.findOne();
  if (!config) {
    config = await CanteenConfig.create({});
  }
  return config;
}

/**
 * Calculates current queue delay and kitchen workload metrics.
 */
async function getQueueEstimation() {
  const config = await getConfig();
  
  // Find active orders currently in kitchen queue
  const activeOrders = await Order.find({
    status: { $in: ['ORDER PLACED', 'PAYMENT CONFIRMED', 'PREPARING'] }
  });

  // Calculate total remaining preparation work in minutes
  let totalRemainingPrepMins = 0;

  for (const order of activeOrders) {
    let orderPrepMins = 0;
    // Calculate prep time for remaining items in this order
    const unreadyItems = order.items.filter(item => item.itemStatus !== 'READY');
    if (unreadyItems.length > 0) {
      // Find food items to get accurate prep times
      const foodIds = unreadyItems.map(i => i.foodItemId);
      const foods = await FoodItem.find({ _id: { $in: foodIds } });
      const foodMap = new Map(foods.map(f => [f._id.toString(), f.prepTime || 5]));
      
      orderPrepMins = unreadyItems.reduce((sum, item) => {
        const itemPrep = foodMap.get(item.foodItemId.toString()) || 5;
        return sum + (itemPrep * (item.quantity || 1));
      }, 0);
    }
    
    totalRemainingPrepMins += orderPrepMins;
  }

  // Account for concurrent preparation stations (kitchenPrepSlots)
  const slots = Math.max(1, config.kitchenPrepSlots);
  const rawQueueDelay = Math.ceil(totalRemainingPrepMins / slots);

  // Check historical actual prep data if available (last 10 completed orders)
  const completedOrders = await Order.find({
    status: { $in: ['FOOD PREPARED', 'COLLECTED'] },
    preparedAt: { $exists: true },
    paidAt: { $exists: true }
  }).sort({ createdAt: -1 }).limit(10);

  let historicalMultiplier = 1.0;
  let isFallback = true;

  if (completedOrders.length >= 3) {
    isFallback = false;
    let totalEstimated = 0;
    let totalActual = 0;
    for (const order of completedOrders) {
      const actualMs = new Date(order.preparedAt) - new Date(order.paidAt);
      const actualMins = Math.max(1, actualMs / (1000 * 60));
      const estimatedMins = order.estimatedTotalTime || 8;
      totalEstimated += estimatedMins;
      totalActual += actualMins;
    }
    if (totalEstimated > 0) {
      historicalMultiplier = Math.min(2.0, Math.max(0.5, totalActual / totalEstimated));
    }
  }

  const estimatedQueueDelay = Math.round(rawQueueDelay * historicalMultiplier);

  // Determine workload level label
  let delayLabel = 'Low';
  let delayClass = 'success';
  if (estimatedQueueDelay > config.highDelayThresholdMins) {
    delayLabel = 'High';
    delayClass = 'danger';
  } else if (estimatedQueueDelay >= config.lowDelayThresholdMins) {
    delayLabel = 'Moderate';
    delayClass = 'warning';
  }

  return {
    pendingOrderCount: activeOrders.filter(o => o.status !== 'PREPARING').length,
    preparingOrderCount: activeOrders.filter(o => o.status === 'PREPARING').length,
    activeOrderCount: activeOrders.length,
    totalRemainingPrepMins,
    estimatedQueueDelay,
    delayLabel,
    delayClass,
    kitchenSlots: slots,
    isFallback,
    fallbackMessage: isFallback ? 'Estimate based on current standard prep rules (insufficient historical completion data).' : null
  };
}

/**
 * Calculates available break time from class time or duration input.
 */
function calculateBreakDuration(availableDurationMins, nextClassTimeStr) {
  let minutes = parseInt(availableDurationMins, 10) || 15;
  let timeSource = 'duration';
  let warningMessage = null;

  if (nextClassTimeStr) {
    try {
      // Parse HH:MM format
      const parts = nextClassTimeStr.split(':');
      if (parts.length === 2) {
        const now = new Date();
        const nowNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);

        // If target is earlier today, check if it's within 12h or expired
        let diffMs = target.getTime() - nowNormalized.getTime();
        if (diffMs < 0) {
          // If expired class time
          warningMessage = 'Specified class time is in the past. Using default break duration.';
        } else {
          const diffMins = Math.round(diffMs / (1000 * 60));
          if (diffMins > 0 && diffMins <= 480) { // cap at 8 hours
            minutes = diffMins;
            timeSource = 'classTime';
          } else if (diffMins > 480) {
            warningMessage = 'Class time is too far in future (> 8 hours). Using selected break duration.';
          }
        }
      }
    } catch (err) {
      warningMessage = 'Invalid next class time format. Using default break duration.';
    }
  }

  return {
    availableBreakMins: minutes,
    timeSource,
    warningMessage
  };
}

/**
 * Smart Food Recommendations based on break time, queue delay, budget, prep time.
 */
async function getSmartRecommendations(params) {
  const { availableDurationMins, nextClassTime, maxBudget } = params;
  const config = await getConfig();
  const queueInfo = await getQueueEstimation();
  const breakInfo = calculateBreakDuration(availableDurationMins, nextClassTime);
  const breakMins = breakInfo.availableBreakMins;

  const foods = await FoodItem.find();
  const budgetFilter = maxBudget && parseFloat(maxBudget) > 0 ? parseFloat(maxBudget) : null;

  const recommendations = foods.map(food => {
    const isAvailable = food.available;
    const prepTime = food.prepTime || 5;
    const queueDelay = queueInfo.estimatedQueueDelay;
    const pickupHandling = config.pickupHandlingMins || 1;

    // A. Estimated Collection Time = queueDelay + prepTime + pickupHandling
    const collectionTimeMins = queueDelay + prepTime + pickupHandling;

    // B. Estimated Total Lunch Time = collectionTime + walking + eating
    const totalLunchTimeMins = collectionTimeMins + (config.walkingTimeMins || 3) + (config.eatingTimeMins || 5);

    // C. Remaining Break Time
    const remainingTimeMins = breakMins - totalLunchTimeMins;

    // Fit assessment
    let fitStatus = 'FIT'; // 'FIT', 'TIGHT', 'EXCEEDS'
    let fitLabel = 'Fits Your Break';
    let fitBadgeClass = 'success';
    let explanation = `Ready in ~${collectionTimeMins} mins. Total lunch time ~${totalLunchTimeMins} mins fits your ${breakMins} min break.`;

    if (collectionTimeMins > breakMins) {
      fitStatus = 'EXCEEDS';
      fitLabel = 'Exceeds Break';
      fitBadgeClass = 'danger';
      explanation = `Takes ~${collectionTimeMins} mins to collect, which exceeds your available ${breakMins} min break time.`;
    } else if (remainingTimeMins < 2) {
      fitStatus = 'TIGHT';
      fitLabel = 'Tight Schedule';
      fitBadgeClass = 'warning';
      explanation = `Takes ~${collectionTimeMins} mins to collect. Leaves less than 2 mins spare before your next class.`;
    }

    let budgetFits = true;
    if (budgetFilter && food.price > budgetFilter) {
      budgetFits = false;
    }

    return {
      _id: food._id,
      name: food.name,
      description: food.description,
      category: food.category,
      price: food.price,
      image: food.image,
      available: food.available,
      prepTime,
      queueDelay,
      pickupHandling,
      collectionTimeMins,
      totalLunchTimeMins,
      remainingTimeMins,
      fitStatus,
      fitLabel,
      fitBadgeClass,
      budgetFits,
      explanation,
      isRecommended: isAvailable && budgetFits && fitStatus !== 'EXCEEDS'
    };
  });

  // Sort: Recommended first, then FIT status, then lowest collection time, then lowest price
  recommendations.sort((a, b) => {
    if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
    if (a.fitStatus !== b.fitStatus) {
      const order = { 'FIT': 1, 'TIGHT': 2, 'EXCEEDS': 3 };
      return order[a.fitStatus] - order[b.fitStatus];
    }
    if (a.collectionTimeMins !== b.collectionTimeMins) {
      return a.collectionTimeMins - b.collectionTimeMins;
    }
    return a.price - b.price;
  });

  const suitableCount = recommendations.filter(r => r.isRecommended).length;

  return {
    queueInfo,
    breakInfo,
    config: {
      pickupHandlingMins: config.pickupHandlingMins,
      walkingTimeMins: config.walkingTimeMins,
      eatingTimeMins: config.eatingTimeMins
    },
    recommendations,
    suitableCount,
    noMatchMessage: suitableCount === 0 
      ? `No available meals fit within your ${breakMins} min break and ₹${budgetFilter || 'any'} budget under current queue conditions. Consider increasing break duration or selecting a later pickup time.`
      : null
  };
}

/**
 * Generates available pickup windows and checks capacity.
 */
async function getAvailablePickupWindows() {
  const config = await getConfig();
  const queueInfo = await getQueueEstimation();
  const minDelay = queueInfo.estimatedQueueDelay + 5; // minimum delay before pickup can start

  const windows = [];
  const now = new Date();
  const slotDuration = config.pickupWindowDurationMins || 10;
  const maxPerSlot = config.maxOrdersPerPickupWindow || 5;

  // Generate 6 upcoming slots
  for (let i = 0; i < 6; i++) {
    const slotOffsetMins = minDelay + (i * slotDuration);
    const startTime = new Date(now.getTime() + slotOffsetMins * 60000);
    const endTime = new Date(startTime.getTime() + slotDuration * 60000);

    const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotLabel = `${formatTime(startTime)} - ${formatTime(endTime)}`;

    // Count existing active orders in this pickup slot
    const orderCount = await Order.countDocuments({
      'pickupWindow.slotLabel': slotLabel,
      status: { $in: ['ORDER PLACED', 'PAYMENT CONFIRMED', 'PREPARING', 'FOOD PREPARED'] }
    });

    let status = 'AVAILABLE'; // 'AVAILABLE', 'LIMITED', 'FULL'
    if (orderCount >= maxPerSlot) {
      status = 'FULL';
    } else if (orderCount >= maxPerSlot - 1) {
      status = 'LIMITED';
    }

    windows.push({
      slotLabel,
      startTime,
      endTime,
      orderCount,
      maxCapacity: maxPerSlot,
      status,
      isAvailable: status !== 'FULL',
      estimatedMinutesAway: slotOffsetMins
    });
  }

  return windows;
}

module.exports = {
  getConfig,
  getQueueEstimation,
  calculateBreakDuration,
  getSmartRecommendations,
  getAvailablePickupWindows
};
