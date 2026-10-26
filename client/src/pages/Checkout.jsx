import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLunchTime } from '../context/LunchTimeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

const Checkout = () => {
  const { cartItems, total, subtotal, selectedPickupWindow, setSelectedPickupWindow } = useCart();
  const { user } = useAuth();
  const { queueInfo, pickupWindows, recommendationData } = useLunchTime();
  const navigate = useNavigate();

  // Calculate cart timing
  const queueDelay = queueInfo?.estimatedQueueDelay || 0;
  const maxPrepTime = cartItems.reduce((max, item) => Math.max(max, item.prepTime || 5), 5);
  const totalEstCollectionTime = queueDelay + maxPrepTime + 1; // +1 min handling
  const breakMins = recommendationData?.breakInfo?.availableBreakMins || 15;
  const isOverBreak = totalEstCollectionTime > breakMins;

  // Set default pickup window if none selected
  useEffect(() => {
    if (!selectedPickupWindow && pickupWindows && pickupWindows.length > 0) {
      const available = pickupWindows.find(w => w.isAvailable);
      if (available) {
        setSelectedPickupWindow(available);
      }
    }
  }, [pickupWindows, selectedPickupWindow, setSelectedPickupWindow]);

  if (cartItems.length === 0) {
    return (
      <div className="text-center" style={{ marginTop: '10vh' }}>
        <h2 className="text-2xl mb-4">Your cart is empty</h2>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Time-Aware Checkout</h1>

      {/* Feature Seven Warning Banner if Order Exceeds Break */}
      {isOverBreak && (
        <div className="card p-6 mb-6 border-l-4 border-danger bg-red-50 text-red-900" style={{ borderLeftColor: 'var(--danger)', backgroundColor: '#fef2f2' }}>
          <div className="flex items-start gap-3">
            <ShieldAlert size={24} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg text-danger mb-1">Time Alert: Meal Exceeds Available Break!</h3>
              <p className="text-sm text-muted mb-3">
                Estimated collection time is <strong>~{totalEstCollectionTime} mins</strong>, but your available lunch break is <strong>{breakMins} mins</strong>.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/menu" className="btn-secondary text-xs py-1.5 px-3">
                  Choose Faster Menu Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Left Column: Student Info & Time Breakdown */}
        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              Student Information
            </h2>
            <div className="mb-2">
              <span className="text-muted">Name: </span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Student ID: </span>
              <span className="font-semibold">{user.studentId}</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Email: </span>
              <span className="font-semibold">{user.email}</span>
            </div>
          </div>

          {/* Time Analysis Box */}
          <div className="card p-6" style={{ borderTop: `4px solid ${isOverBreak ? 'var(--danger)' : 'var(--success)'}` }}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <Clock size={20} className="text-primary" /> Break & Collection Time Summary
            </h2>
            
            <div className="flex flex-col gap-2 text-sm mb-4">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted">Kitchen Queue Delay:</span>
                <span className="font-semibold">{queueDelay} mins ({queueInfo?.delayLabel || 'Low'})</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted">Max Prep Time (Items):</span>
                <span className="font-semibold">{maxPrepTime} mins</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted">Pickup Handling:</span>
                <span className="font-semibold">1 min</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base border-b">
                <span>Est. Ready/Collection:</span>
                <span style={{ color: isOverBreak ? 'var(--danger)' : 'var(--success)' }}>
                  ~{totalEstCollectionTime} mins
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Your Available Break:</span>
                <span className="font-bold">{breakMins} mins</span>
              </div>
            </div>

            <div className="p-3 rounded-lg text-xs font-semibold text-center" style={{
              backgroundColor: isOverBreak ? '#fef2f2' : '#f0fdf4',
              color: isOverBreak ? 'var(--danger)' : 'var(--success)',
              border: `1px solid ${isOverBreak ? '#fecaca' : '#bbf7d0'}`
            }}>
              {isOverBreak 
                ? '⚠️ Unlikely to fit inside your break duration' 
                : '✓ Easily fits within your available lunch break!'}
            </div>
          </div>

          {/* Feature Four: Smart Pickup Slot Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-3 border-b pb-2 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Preferred Pickup Window (Optional)
            </h2>
            <p className="text-xs text-muted mb-4">
              Slots capped at kitchen capacity to avoid overcrowding.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-2">
              {pickupWindows.map(window => {
                const isSelected = selectedPickupWindow?.slotLabel === window.slotLabel;
                const isFull = !window.isAvailable;

                return (
                  <button
                    key={window.slotLabel}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedPickupWindow(window)}
                    className="p-3 rounded-lg text-left transition-all text-xs border flex flex-col justify-between"
                    style={{
                      borderColor: isSelected ? 'var(--primary-color)' : isFull ? '#cbd5e1' : 'var(--border-color)',
                      backgroundColor: isSelected ? '#fffaf5' : isFull ? '#f8fafc' : 'white',
                      opacity: isFull ? 0.6 : 1,
                      cursor: isFull ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="font-bold text-sm mb-1">{window.slotLabel}</div>
                    <div className="flex justify-between items-center text-muted">
                      <span>{window.orderCount}/{window.maxCapacity} Orders</span>
                      <span className="font-semibold" style={{
                        color: isFull ? 'var(--danger)' : window.status === 'LIMITED' ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {window.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedPickupWindow && (
              <div className="text-xs text-primary font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 size={14} /> Selected Window: <strong>{selectedPickupWindow.slotLabel}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Actions */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Items Summary</h2>
          <div className="flex flex-col gap-3 mb-4">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <div className="font-medium">{item.name} × {item.quantity}</div>
                  <div className="text-xs text-muted">Prep: {item.prepTime || 5} mins</div>
                </div>
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mb-2 flex justify-between text-sm">
            <span className="text-muted">Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-primary mb-6">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>

          <button 
            className="btn-primary w-full py-3 text-lg font-bold"
            onClick={() => navigate('/payment')}
          >
            PROCEED TO PAYMENT (₹{total})
          </button>
          <button 
            className="btn-secondary w-full mt-3 text-sm py-2"
            onClick={() => navigate('/cart')}
          >
            EDIT CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
