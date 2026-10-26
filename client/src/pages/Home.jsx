import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, UtensilsCrossed, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-hero-wrapper">
      <div className="home-hero-content">
        <h1 className="home-hero-title">
          <span>SMART CANTEEN</span>
        </h1>

        <h2 className="home-hero-subtitle">
          Order Now. Skip the Queue. Collect When Ready.
        </h2>

        {user ? (
          <div className="home-hero-actions">
            {user.role === 'student' ? (
              <Link to="/menu" className="home-btn-primary">
                <UtensilsCrossed size={18} />
                <span>ORDER FOOD</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/staff/orders" className="home-btn-primary">
                <Shield size={18} />
                <span>GO TO DASHBOARD</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        ) : (
          <div className="home-hero-actions">
            <Link to="/login" className="home-btn-primary">
              LOGIN
            </Link>
            <Link to="/register" className="home-btn-secondary">
              REGISTER
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
