import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config/api';

const DigitalBill = () => {
  const { billNumber } = useParams();
  const { user } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bills/${billNumber}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBill(res.data);
      } catch (error) {
        console.error('Error fetching bill', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billNumber]);

  if (loading) return <div className="text-center py-10">Loading Bill...</div>;
  if (!bill) return <div className="text-center py-10 text-danger">Bill not found</div>;

  const order = bill.orderId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-white" style={{ fontFamily: 'monospace' }}>
        {/* Bill Header */}
        <div className="p-6 border-b-2 border-dashed text-center">
          <h1 className="text-2xl font-bold mb-2">SMART CANTEEN</h1>
          <p className="text-muted">Order Now. Skip the Queue. Collect When Ready.</p>
        </div>

        {/* Bill Info */}
        <div className="p-6 border-b-2 border-dashed">
          <div className="flex justify-between mb-2">
            <span>Bill Number:</span>
            <span className="font-bold">{bill.billNumber}</span>
          </div>
          <div className="flex justify-between mb-6">
            <span>Order ID:</span>
            <span>{order.orderNumber}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Student Name:</span>
            <span>{user?.name || order.studentId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Student ID:</span>
            <span>{user?.studentId || 'N/A'}</span>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 border-b-2 border-dashed">
          <div className="flex justify-between font-bold mb-4 border-b pb-2">
            <span className="w-1/2">Item</span>
            <span className="w-1/4 text-center">Qty</span>
            <span className="w-1/4 text-right">Amount</span>
          </div>
          
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map(item => (
              <div key={item._id} className="flex justify-between">
                <span className="w-1/2">{item.foodName}</span>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-right">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-4">
            <span>Total Amount</span>
            <span>₹{bill.amount}</span>
          </div>
        </div>

        {/* Payment & Status Info */}
        <div className="p-6">
          <div className="flex justify-between mb-2">
            <span>Payment Method:</span>
            <span>{order.paymentMethod || 'UPI'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Transaction ID:</span>
            <span>{order.transactionId || 'N/A'}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Payment Status:</span>
            <span className="text-success font-bold">{bill.paymentStatus}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Order Status:</span>
            <span className="font-bold text-primary">{order.status}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="btn-primary flex-1" onClick={() => window.print()}>PRINT BILL</button>
        <Link to="/my-orders" className="btn-secondary flex-1 text-center">VIEW ORDERS</Link>
      </div>
    </div>
  );
};

export default DigitalBill;
