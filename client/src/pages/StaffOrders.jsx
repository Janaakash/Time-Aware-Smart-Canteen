import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Clock, AlertTriangle, Flame, BellRing, Calendar } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStaffData = async () => {
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/staff/orders`, authHeaders),
        axios.get(`${API_BASE_URL}/api/staff/summary`, authHeaders)
      ]);
      setOrders(ordersRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch staff data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    const interval = setInterval(fetchStaffData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkItemReady = async (orderId, itemId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/staff/orders/${orderId}/items/${itemId}/ready`, {}, authHeaders);
      fetchStaffData();
    } catch (error) {
      alert('Failed to mark item ready');
    }
  };

  const handleFlagDelay = async (orderId) => {
    const additionalMins = prompt('Enter delay in additional minutes (e.g. 5):', '5');
    if (!additionalMins) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/staff/orders/${orderId}/delay`, {
        additionalMins: parseInt(additionalMins, 10),
        reason: 'High kitchen queue volume'
      }, authHeaders);
      fetchStaffData();
      alert('Student notified of order delay via Socket.IO');
    } catch (error) {
      alert('Failed to flag delay');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading Kitchen Dashboard & Workload Metrics...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Flame size={28} /> Kitchen Workload & Orders Dashboard
        </h1>
        <button className="btn-secondary text-sm" onClick={fetchStaffData}>
          🔄 Refresh Orders
        </button>
      </div>

      {/* Feature Six: Workload Summary Bar */}
      {summary && (
        <div className="grid grid-cols-6 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="card p-4 text-center bg-amber-50" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
            <div className="text-xs font-bold text-amber-800 uppercase">Pending</div>
            <div className="text-2xl font-bold text-amber-900">{summary.pendingCount}</div>
          </div>
          <div className="card p-4 text-center bg-blue-50" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div className="text-xs font-bold text-blue-800 uppercase">Preparing</div>
            <div className="text-2xl font-bold text-blue-900">{summary.preparingCount}</div>
          </div>
          <div className="card p-4 text-center bg-emerald-50" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="text-xs font-bold text-emerald-800 uppercase">Ready Pickup</div>
            <div className="text-2xl font-bold text-emerald-900">{summary.readyCount}</div>
          </div>
          <div className="card p-4 text-center bg-purple-50" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <div className="text-xs font-bold text-purple-800 uppercase">Est. Workload</div>
            <div className="text-lg font-bold text-purple-900">{summary.estimatedQueueDelayMins}m ({summary.workloadLabel})</div>
          </div>
          <div className="card p-4 text-center bg-slate-50" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="text-xs font-bold text-slate-700 uppercase">Pickup Slots</div>
            <div className="text-2xl font-bold text-slate-800">{summary.upcomingCommitments}</div>
          </div>
          <div className="card p-4 text-center bg-red-50" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <div className="text-xs font-bold text-red-800 uppercase">Overdue / At-Risk</div>
            <div className="text-2xl font-bold text-red-900">{summary.atRiskCount}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* PREPARING COLUMN (Prioritized) */}
        <div>
          <h2 className="text-xl font-bold mb-4 bg-warning text-white p-2.5 rounded-lg text-center flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--warning)' }}>
            <Clock size={20} /> KITCHEN QUEUE / PREPARING ({orders.filter(o => o.status !== 'FOOD PREPARED').length})
          </h2>
          <div className="flex flex-col gap-4">
            {orders.filter(o => o.status !== 'FOOD PREPARED').map(order => {
              const isAtRisk = order.isAtRisk;

              return (
                <div 
                  key={order._id} 
                  className="card p-4 transition-all"
                  style={{
                    borderLeft: `5px solid ${isAtRisk ? 'var(--danger)' : 'var(--warning)'}`,
                    backgroundColor: isAtRisk ? '#fff5f5' : 'white'
                  }}
                >
                  <div className="flex justify-between items-start border-b pb-2 mb-2">
                    <div>
                      <span className="font-bold text-base">Bill: {order.billNumber}</span>
                      <div className="text-xs text-muted">ID: {order.orderNumber} • Student: {order.studentId?.name || 'Student'}</div>
                    </div>
                    {isAtRisk && (
                      <span className="bg-danger text-white text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> AT RISK
                      </span>
                    )}
                  </div>

                  {/* Pickup Slot & Estimated Target */}
                  {order.pickupWindow?.slotLabel && (
                    <div className="text-xs mb-3 p-1.5 rounded bg-slate-100 flex justify-between items-center font-medium">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar size={12} /> Target Slot: <strong>{order.pickupWindow.slotLabel}</strong>
                      </span>
                      {order.estimatedReadyAt && (
                        <span className="text-muted">Est Ready: {new Date(order.estimatedReadyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  )}

                  {/* Order Items with Prep Time */}
                  <div className="mb-3">
                    {order.items.map(item => (
                      <div key={item._id} className="flex justify-between items-center py-1.5 border-b text-sm" style={{ borderColor: '#f1f5f9' }}>
                        <div>
                          <span className="font-semibold">{item.quantity}x</span> {item.foodName}
                        </div>
                        {item.itemStatus === 'READY' ? (
                          <span className="text-success font-bold flex items-center gap-1 text-xs">
                            <Check size={14}/> READY
                          </span>
                        ) : (
                          <button 
                            className="btn-primary py-1 px-2 text-xs"
                            onClick={() => handleMarkItemReady(order._id, item._id)}
                          >
                            Mark Item Ready
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Staff Actions */}
                  <div className="flex justify-between items-center pt-2 border-t text-xs">
                    <button 
                      className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
                      onClick={() => handleFlagDelay(order._id)}
                    >
                      <BellRing size={12} /> Flag Delay / Notify
                    </button>
                    <span className="text-muted">Paid: ₹{order.totalAmount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* READY TO COLLECT COLUMN */}
        <div>
          <h2 className="text-xl font-bold mb-4 bg-success text-white p-2.5 rounded-lg text-center flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--success)' }}>
            <Check size={20} /> READY FOR PICKUP ({orders.filter(o => o.status === 'FOOD PREPARED').length})
          </h2>
          <div className="flex flex-col gap-4">
            {orders.filter(o => o.status === 'FOOD PREPARED').map(order => (
              <div key={order._id} className="card p-4 border-l-4" style={{ borderLeftColor: 'var(--success)' }}>
                <div className="flex justify-between border-b pb-2 mb-2">
                  <div>
                    <span className="font-bold text-lg text-success">Bill: {order.billNumber}</span>
                    <div className="text-xs text-muted">Student: {order.studentId?.name} ({order.studentId?.studentId || 'STU'})</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-success bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      FOOD PREPARED
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  {order.items.map(item => (
                    <div key={item._id} className="text-sm py-0.5 text-slate-700">
                      • {item.quantity}x {item.foodName}
                    </div>
                  ))}
                </div>

                <div className="text-xs font-bold text-center py-2 bg-emerald-50 rounded text-emerald-800 mb-2 animate-pulse">
                  🔔 NOTIFICATION SENT TO STUDENT PHONE
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOrders;
