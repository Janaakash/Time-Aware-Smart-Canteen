const axios = require('axios');

async function test() {
  try {
    // 1. login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@example.com',
      password: 'student123'
    });
    
    const token = loginRes.data.token;
    
    // 2. submit order
    const orderRes = await axios.post('http://localhost:5000/api/orders', {
      items: [
        {
          foodItemId: '66e13b8f9876543210123456', // dummy 24-char hex
          foodName: 'Test Item',
          quantity: 1,
          price: 50
        }
      ],
      subtotal: 50,
      totalAmount: 50,
      paymentStatus: 'SUCCESSFUL',
      paymentMethod: 'Google Pay',
      transactionId: 'TXN123456789'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Success:", orderRes.data);
  } catch (error) {
    console.error("Failed:", error.response ? error.response.data : error.message);
  }
}

test();
