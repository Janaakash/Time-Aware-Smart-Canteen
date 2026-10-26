import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User, Clock, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="text-primary font-bold flex items-center gap-2" style={{ fontSize: '1.4rem' }}>
        <Clock size={24} /> SMART CANTEEN
      </Link>
      
      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/menu" className="nav-link font-semibold">Menu & Lunch Break</Link>
                <Link to="/my-orders" className="nav-link">My Orders</Link>
                <Link to="/cart" className="nav-link flex items-center gap-2">
                  <ShoppingCart size={20} />
                  {cartItems.length > 0 && (
                    <span style={{ background: 'var(--primary-color)', color: 'white', borderRadius: '50%', padding: '0 6px', fontSize: '12px' }}>
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {(user.role === 'staff' || user.role === 'admin') && (
              <>
                <Link to="/staff/orders" className="nav-link font-semibold">Kitchen Dashboard</Link>
                <Link to="/staff/verify" className="nav-link">Verify Bill</Link>
                <Link to="/admin/settings" className="nav-link flex items-center gap-1">
                  <Settings size={18} /> Settings
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 ml-4">
              <User size={18} />
              <span className="font-semibold text-sm">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary ml-3 flex items-center gap-1 text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
