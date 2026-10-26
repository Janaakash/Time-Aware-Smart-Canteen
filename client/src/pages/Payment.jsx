import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config/api';

const Payment = () => {
  const { cartItems, total, subtotal, clearCart, selectedPickupWindow } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('Google Pay');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate API delay
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);
      
      const newTxnId = `TXN${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`;
      setTxnId(newTxnId);
      
      try {
        const formattedItems = cartItems.map(item => ({
          foodItemId: item._id,
          foodName: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        const res = await axios.post(`${API_BASE_URL}/api/orders`, {
          items: formattedItems,
          subtotal,
          totalAmount: total,
          paymentStatus: 'SUCCESSFUL',
          paymentMethod,
          transactionId: newTxnId,
          pickupWindow: selectedPickupWindow
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        clearCart();
        
        // Wait 2s to show success before redirecting to digital bill
        setTimeout(() => {
          navigate(`/digital-bill/${res.data.bill.billNumber}`);
        }, 2000);

      } catch (error) {
        console.error('Error placing order', error);
        alert('Payment successful, but failed to create order in database.');
        setSuccess(false);
      }
    }, 2000);
  };

  if (cartItems.length === 0 && !success) {
    return (
      <div className="text-center mt-10">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Payment</h1>
      
      <div className="card p-6">
        {!processing && !success && (
          <>
            <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
            
            <div className="flex flex-col gap-3 mb-6">
              {['Google Pay', 'PhonePe', 'BHIM UPI', 'Other UPI'].map(method => (
                <label key={method} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: paymentMethod === method ? 'var(--primary-color)' : 'var(--border-color)', backgroundColor: paymentMethod === method ? '#fffaf5' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="font-medium">{method}</span>
                </label>
              ))}
            </div>

            <button 
              className="btn-primary w-full text-lg py-3"
              onClick={handlePayment}
            >
              PAY ₹{total}
            </button>
            <button 
              className="btn-secondary w-full mt-3"
              onClick={() => navigate('/checkout')}
            >
              CANCEL
            </button>
          </>
        )}

        {processing && (
          <div className="text-center py-10">
            <div className="mb-4">
              <span className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ animation: 'spin 1s linear infinite' }}></span>
            </div>
            <h2 className="text-2xl font-bold text-muted">PROCESSING PAYMENT...</h2>
            <p className="mt-2 text-muted">Please do not close this window</p>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {success && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-success mb-6">PAYMENT SUCCESSFUL</h2>
            
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-muted">Payment Amount:</span>
                <span className="font-bold">₹{total}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Payment Method:</span>
                <span className="font-bold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Transaction ID:</span>
                <span className="font-bold">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Status:</span>
                <span className="font-bold text-success">SUCCESSFUL</span>
              </div>
            </div>
            
            <p className="text-muted text-sm">Generating Digital Bill...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
