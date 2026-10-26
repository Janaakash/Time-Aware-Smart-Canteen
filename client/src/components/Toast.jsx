import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Toast = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const shownNotifIds = React.useRef(new Set());

  const handleNewNotification = (notif) => {
    if (!notif || shownNotifIds.current.has(notif._id)) return;
    shownNotifIds.current.add(notif._id);

    setNotifications(prev => [...prev, notif]);

    if (Notification.permission === 'granted') {
      new Notification('Smart Canteen', {
        body: notif.message,
        icon: '/favicon.svg'
      });
    }

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
    }, 10000);
  };

  useEffect(() => {
    if (socket) {
      socket.on('notification', handleNewNotification);
    }

    // Polling fallback every 6 seconds for serverless / Vercel
    let intervalId;
    if (user && user.role === 'student') {
      const pollNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const unread = data.filter(n => !n.read && !shownNotifIds.current.has(n._id));
            unread.forEach(n => handleNewNotification(n));
          }
        } catch (e) {
          // ignore network errors silently in background poll
        }
      };

      pollNotifications();
      intervalId = setInterval(pollNotifications, 6000);
    }

    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [socket, user]);

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
