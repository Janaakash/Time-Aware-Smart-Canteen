import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const LunchTimeContext = createContext();

export const LunchTimeProvider = ({ children }) => {
  const [breakDuration, setBreakDuration] = useState(() => localStorage.getItem('lunch_breakDuration') || '15');
  const [nextClassTime, setNextClassTime] = useState(() => localStorage.getItem('lunch_nextClassTime') || '');
  const [maxBudget, setMaxBudget] = useState(() => localStorage.getItem('lunch_maxBudget') || '');
  
  const [queueInfo, setQueueInfo] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [pickupWindows, setPickupWindows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('lunch_breakDuration', breakDuration);
    localStorage.setItem('lunch_nextClassTime', nextClassTime);
    localStorage.setItem('lunch_maxBudget', maxBudget);
  }, [breakDuration, nextClassTime, maxBudget]);

  // Fetch recommendations and queue status from backend
  const refreshTimeData = async () => {
    setLoading(true);
    try {
      const [queueRes, recRes, windowsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/time/queue-status`),
        axios.get(`${API_BASE_URL}/api/time/recommendations`, {
          params: { breakDuration, nextClassTime, maxBudget }
        }),
        axios.get(`${API_BASE_URL}/api/time/pickup-windows`)
      ]);

      setQueueInfo(queueRes.data);
      setRecommendationData(recRes.data);
      setPickupWindows(windowsRes.data);

      if (recRes.data?.breakInfo?.warningMessage) {
        setWarning(recRes.data.breakInfo.warningMessage);
      } else {
        setWarning('');
      }
    } catch (err) {
      console.error('Error fetching time data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTimeData();
    const interval = setInterval(refreshTimeData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [breakDuration, nextClassTime, maxBudget]);

  return (
    <LunchTimeContext.Provider value={{
      breakDuration,
      setBreakDuration,
      nextClassTime,
      setNextClassTime,
      maxBudget,
      setMaxBudget,
      queueInfo,
      recommendationData,
      pickupWindows,
      loading,
      warning,
      refreshTimeData
    }}>
      {children}
    </LunchTimeContext.Provider>
  );
};

export const useLunchTime = () => useContext(LunchTimeContext);
