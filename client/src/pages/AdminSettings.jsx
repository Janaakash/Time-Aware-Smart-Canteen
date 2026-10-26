import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, Save, CheckCircle } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const AdminSettings = () => {
  const [config, setConfig] = useState({
    maxOrdersPerPickupWindow: 5,
    kitchenPrepSlots: 3,
    pickupWindowDurationMins: 10,
    pickupHandlingMins: 1,
    walkingTimeMins: 3,
    eatingTimeMins: 5,
    lowDelayThresholdMins: 5,
    highDelayThresholdMins: 15,
    openingTime: '08:00',
    closingTime: '20:00'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/config`, authHeaders);
        if (res.data) setConfig(res.data);
      } catch (err) {
        console.error('Error fetching admin config', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await axios.put(`${API_BASE_URL}/api/admin/config`, config, authHeaders);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading Settings...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2">
        <Settings size={28} /> Admin Canteen Capacity & Timing Settings
      </h1>

      {message && (
        <div className="p-3 mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            <label className="block text-sm font-semibold mb-1">Max Orders per Pickup Window</label>
            <input
              type="number"
              name="maxOrdersPerPickupWindow"
              min="1"
              max="50"
              className="input-field"
              value={config.maxOrdersPerPickupWindow}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Limits scheduled orders per slot</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Kitchen Prep Slots / Stations</label>
            <input
              type="number"
              name="kitchenPrepSlots"
              min="1"
              max="20"
              className="input-field"
              value={config.kitchenPrepSlots}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Number of parallel kitchen prep stations</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Pickup Window Duration (Mins)</label>
            <input
              type="number"
              name="pickupWindowDurationMins"
              min="5"
              max="60"
              className="input-field"
              value={config.pickupWindowDurationMins}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Duration of each pickup slot</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Pickup Handling Time (Mins)</label>
            <input
              type="number"
              name="pickupHandlingMins"
              min="0"
              max="15"
              className="input-field"
              value={config.pickupHandlingMins}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Counter handoff delay</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Low Delay Threshold (Mins)</label>
            <input
              type="number"
              name="lowDelayThresholdMins"
              min="1"
              className="input-field"
              value={config.lowDelayThresholdMins}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Below this queue delay is labeled "Low"</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">High Delay Threshold (Mins)</label>
            <input
              type="number"
              name="highDelayThresholdMins"
              min="5"
              className="input-field"
              value={config.highDelayThresholdMins}
              onChange={handleChange}
              required
            />
            <span className="text-xs text-muted">Above this queue delay is labeled "High"</span>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Opening Time</label>
            <input
              type="time"
              name="openingTime"
              className="input-field"
              value={config.openingTime}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Closing Time</label>
            <input
              type="time"
              name="closingTime"
              className="input-field"
              value={config.closingTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-2 flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2 py-2 px-6" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Settings...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
