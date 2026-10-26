import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Hash, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UtensilsCrossed, 
  AlertCircle,
  GraduationCap,
  ChefHat,
  Shield
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', studentId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        studentId: role === 'student' ? formData.studentId : undefined
      };
      await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            <UtensilsCrossed size={14} /> 
            {role === 'student' && ' Student Registration'}
            {role === 'staff' && ' Kitchen Staff Registration'}
            {role === 'admin' && ' Administrator Registration'}
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            {role === 'student' && 'Join Smart Canteen to order meals and track lunch break pickup'}
            {role === 'staff' && 'Join kitchen operations to manage orders and monitor queue delays'}
            {role === 'admin' && 'Join system administration to manage canteen capacity and slots'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector-container">
          <button
            type="button"
            className={`role-tab-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'staff' ? 'active' : ''}`}
            onClick={() => setRole('staff')}
          >
            <ChefHat size={16} /> Staff
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <Shield size={16} /> Admin
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="register-name">Full Name</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <User size={18} />
              </span>
              <input 
                id="register-name"
                type="text" 
                className="auth-input" 
                placeholder={role === 'student' ? 'e.g. Akash Kumar' : 'e.g. Canteen Chef / Manager'}
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="register-email">Email Address</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
              <input 
                id="register-email"
                type="email" 
                className="auth-input" 
                placeholder={
                  role === 'student' 
                    ? 'student@example.com' 
                    : role === 'staff' 
                    ? 'staff@canteen.com' 
                    : 'admin@canteen.com'
                }
                required 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
          </div>

          {role === 'student' && (
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="register-studentid">Student ID</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Hash size={18} />
                </span>
                <input 
                  id="register-studentid"
                  type="text" 
                  className="auth-input" 
                  placeholder="e.g. STU1001"
                  required 
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })} 
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="register-password">Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={18} />
              </span>
              <input 
                id="register-password"
                type={showPassword ? 'text' : 'password'} 
                className="auth-input" 
                placeholder="Create a password"
                required 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : (
              <>
                <span>Register as {role === 'student' ? 'Student' : role === 'staff' ? 'Staff' : 'Admin'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
