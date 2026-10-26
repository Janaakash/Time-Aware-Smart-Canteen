import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { LunchTimeProvider } from './context/LunchTimeContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import StaffOrders from './pages/StaffOrders';
import VerifyBill from './pages/VerifyBill';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import DigitalBill from './pages/DigitalBill';
import AdminSettings from './pages/AdminSettings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-6 text-center">Loading User Session...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <LunchTimeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  
                  {/* Student Routes */}
                  <Route path="menu" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Menu />
                    </ProtectedRoute>
                  } />
                  <Route path="cart" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="checkout" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="payment" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Payment />
                    </ProtectedRoute>
                  } />
                  <Route path="digital-bill/:billNumber" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <DigitalBill />
                    </ProtectedRoute>
                  } />
                  <Route path="my-orders" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyOrders />
                    </ProtectedRoute>
                  } />

                  {/* Staff & Admin Routes */}
                  <Route path="staff/orders" element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="staff/verify" element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <VerifyBill />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/settings" element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <AdminSettings />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </BrowserRouter>
          </LunchTimeProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
