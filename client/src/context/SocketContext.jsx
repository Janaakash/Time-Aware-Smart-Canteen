import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && user.role === 'student') {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || API_BASE_URL || window.location.origin;
      const newSocket = io(socketUrl, {
        reconnectionAttempts: 3,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', user.id);
      });

      newSocket.on('connect_error', () => {
        // Silently fall back to REST polling without breaking UI
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
