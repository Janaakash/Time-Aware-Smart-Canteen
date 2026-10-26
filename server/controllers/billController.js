const Bill = require('../models/Bill');

exports.getBillByNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await Bill.findOne({ billNumber }).populate({
      path: 'orderId',
      populate: {
        path: 'studentId',
        select: 'name'
      }
    });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill.', error: error.message });
  }
};

exports.getBillByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const bill = await Bill.findOne({ orderId }).populate({
      path: 'orderId',
      populate: {
        path: 'studentId',
        select: 'name'
      }
    });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill.', error: error.message });
  }
};
