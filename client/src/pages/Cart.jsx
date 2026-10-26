import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, total } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const formattedItems = cartItems.map(item => ({
        foodItemId: item._id,
        foodName: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await axios.post('http://localhost:5000/api/orders', {
        items: formattedItems,
        subtotal,
        totalAmount: total,
        paymentStatus: 'PAID' // Demo purpose
      });

      clearCart();
      navigate('/my-orders', { state: { newOrder: res.data } });
    } catch (error) {
      console.error('Error placing order', error);
      alert('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center" style={{ marginTop: '10vh' }}>
        <h2 className="text-2xl mb-4">Your cart is empty</h2>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Your Cart</h1>
      
      <div className="card p-6 mb-6">
        <div className="flex flex-col gap-4">
          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <div className="text-primary font-semibold">₹{item.price}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem' }}><Minus size={16}/></button>
                  <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem' }}><Plus size={16}/></button>
                </div>
                <div className="font-bold text-lg w-20 text-right">
                  ₹{item.price * item.quantity}
                </div>
                <button onClick={() => removeFromCart(item._id)} className="text-danger">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <div style={{ width: '300px' }}>
            <div className="flex justify-between mb-2">
              <span className="text-muted">Subtotal:</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between mb-4 text-xl border-t pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">₹{total}</span>
            </div>
            
            <button 
              className="btn-primary w-full" 
              style={{ fontSize: '1.2rem', padding: '1rem' }}
              onClick={() => navigate('/checkout')}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
