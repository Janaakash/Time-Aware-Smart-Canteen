const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart_canteen');
  const db = mongoose.connection.db;
  const result = await db.collection('orders').updateMany(
    { paymentStatus: 'PAID' },
    { $set: { paymentStatus: 'SUCCESSFUL' } }
  );
  console.log('Updated:', result.modifiedCount);
  process.exit(0);
}
run();
