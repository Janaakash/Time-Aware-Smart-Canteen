import React from 'react';
import Navbar from './Navbar';
import Toast from './Toast';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const isFullBleedPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      <Navbar />
      <Toast />
      <main className={isFullBleedPage ? "main-content-full" : "main-content"}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
