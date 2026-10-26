const timeService = require('../services/timeService');

exports.getQueueStatus = async (req, res) => {
  try {
    const queueData = await timeService.getQueueEstimation();
    res.json(queueData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queue status.', error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { breakDuration, nextClassTime, maxBudget } = req.query;
    const recommendations = await timeService.getSmartRecommendations({
      availableDurationMins: breakDuration,
      nextClassTime,
      maxBudget
    });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations.', error: error.message });
  }
};

exports.getPickupWindows = async (req, res) => {
  try {
    const windows = await timeService.getAvailablePickupWindows();
    res.json(windows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pickup windows.', error: error.message });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const config = await timeService.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching canteen configuration.', error: error.message });
  }
};
