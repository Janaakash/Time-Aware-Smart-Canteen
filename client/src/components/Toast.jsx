import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Toast = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [...prev, notif]);
        
        // Native browser notification if granted
        if (Notification.permission === 'granted') {
          new Notification('Smart Canteen', {
            body: notif.message,
            icon: '/vite.svg'
          });
        }

        // Auto remove toast after 10s
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n._id !== notif._id));
        }, 10000);
      });
    }

    // Request browser permission
    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

  }, [socket]);

  if (!notifications.length) return null;

  return (
    <div className="toast-container">
      {notifications.map((notif, idx) => (
        <div key={idx} className="toast" onClick={() => navigate('/my-orders')}>
          <div className="font-bold text-success mb-1">🔔 YOUR FOOD IS PREPARED!</div>
          <div className="text-sm">{notif.message}</div>
          <div className="text-xs text-muted mt-2">Click to view orders</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
