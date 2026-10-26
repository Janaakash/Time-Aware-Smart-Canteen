import React, { useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const VerifyBill = () => {
  const [billNumber, setBillNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/staff/orders/bill/${billNumber}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Bill not found');
    }
  };

  const handleCollect = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/staff/orders/${order._id}/collect`);
      setOrder({ ...order, status: 'COLLECTED' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as collected');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6 text-primary">Verify Bill Number</h1>
      
      <form onSubmit={handleSearch} className="flex gap-4 justify-center mb-8">
        <input 
          type="text" 
          className="input-field w-64 text-center text-lg font-bold" 
          placeholder="Enter Bill Number (e.g. B...)" 
          value={billNumber}
          onChange={(e) => setBillNumber(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Search size={20} /> SEARCH
        </button>
      </form>

      {error && <div className="text-danger font-bold text-xl">{error}</div>}

      {order && (
        <div className="card p-8 text-left max-w-md mx-auto" style={{ border: '2px dashed var(--primary-color)' }}>
          <h2 className="text-center text-2xl font-bold mb-4" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
            SMART CANTEEN
          </h2>
          
          <div className="mb-4">
            <div><span className="font-semibold">Bill Number:</span> {order.billNumber}</div>
            <div><span className="font-semibold">Order ID:</span> {order.orderNumber}</div>
            <div><span className="font-semibold">Student:</span> {order.studentId?.name}</div>
          </div>

          <table style={{ width: '100%', marginBottom: '1rem' }}>
            <tbody>
              {order.items.map(item => (
                <tr key={item._id} className="border-b" style={{ borderColor: '#f1f5f9' }}>
                  <td className="py-2">{item.foodName}</td>
                  <td className="py-2 text-center">x{item.quantity}</td>
                  <td className="py-2 text-right">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between font-bold text-xl mb-4 border-b pb-4">
            <span>Total:</span>
            <span>₹{order.totalAmount}</span>
          </div>

          <div className="mb-6">
            <div><span className="font-semibold">Payment Status:</span> <span className="text-success">{order.paymentStatus}</span></div>
            <div><span className="font-semibold">Order Status:</span> 
              <span className="font-bold ml-2" style={{ color: order.status === 'COLLECTED' ? 'var(--primary-color)' : order.status === 'FOOD PREPARED' ? 'var(--success)' : 'var(--warning)' }}>
                {order.status}
              </span>
            </div>
          </div>

          {order.status === 'FOOD PREPARED' && (
            <button className="btn-success w-full text-lg py-3" onClick={handleCollect}>
              MARK AS COLLECTED
            </button>
          )}
          {order.status === 'COLLECTED' && (
            <div className="text-center font-bold text-primary text-xl">✓ ORDER ALREADY COLLECTED</div>
          )}
          {order.status !== 'FOOD PREPARED' && order.status !== 'COLLECTED' && (
            <div className="text-center font-bold text-warning text-xl">Food is not prepared yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyBill;
