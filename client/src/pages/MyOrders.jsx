import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

import { API_BASE_URL } from '../config/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/my-orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Poll every 5s for real-time status updates (especially on serverless/Vercel)
    const interval = setInterval(fetchOrders, 5000);

    if (socket) {
      socket.on('orderUpdated', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      });
    }

    return () => clearInterval(interval);
  }, [socket]);

  if (loading) return <div className="p-6 text-center">Loading Orders...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ORDER PLACED': return 'var(--text-muted)';
      case 'PAYMENT CONFIRMED': return 'var(--text-main)';
      case 'PREPARING': return 'var(--warning)';
      case 'FOOD PREPARED': return 'var(--success)';
      case 'COLLECTED': return 'var(--primary-color)';
      default: return 'var(--text-main)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">My Digital Bills</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-muted mt-10">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <div key={order._id} className="card p-6" style={{ borderTop: `4px solid ${getStatusColor(order.status)}` }}>
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold">Bill No: {order.billNumber}</h2>
                  <div className="text-sm text-muted">Order ID: {order.orderNumber}</div>
                  <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: getStatusColor(order.status) }}>
                    {order.status}
                  </div>
                  {order.status === 'FOOD PREPARED' && (
                    <div className="text-success font-bold mt-1 animate-pulse">
                      🔔 YOUR FOOD IS PREPARED!<br/>Please collect now.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="py-2">{item.foodName}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm font-semibold">
                  Payment Status: <span className="text-success">{order.paymentStatus}</span>
                </div>
                <div className="text-xl font-bold text-primary">
                  Total: ₹{order.totalAmount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
