const CanteenConfig = require('../models/CanteenConfig');

exports.getAdminConfig = async (req, res) => {
  try {
    let config = await CanteenConfig.findOne();
    if (!config) {
      config = await CanteenConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin config.', error: error.message });
  }
};

exports.updateAdminConfig = async (req, res) => {
  try {
    let config = await CanteenConfig.findOne();
    if (!config) {
      config = new CanteenConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }
    await config.save();
    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin config.', error: error.message });
  }
};
