import React from 'react';
import { useLunchTime } from '../context/LunchTimeContext';
import { Clock, DollarSign, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

const LunchTimeCalculator = () => {
  const {
    breakDuration,
    setBreakDuration,
    nextClassTime,
    setNextClassTime,
    maxBudget,
    setMaxBudget,
    recommendationData,
    queueInfo,
    warning
  } = useLunchTime();

  const presets = ['10', '15', '20', '30', '45'];
  const activeBreakMins = recommendationData?.breakInfo?.availableBreakMins || parseInt(breakDuration, 10) || 15;
  const queueDelay = queueInfo?.estimatedQueueDelay || 0;
  const recommendedMaxOrderTime = Math.max(1, activeBreakMins - 8); // Buffer for eating & walking

  return (
    <div className="card p-6 mb-8" style={{ borderTop: '4px solid var(--primary-color)', background: 'linear-gradient(180deg, #ffffff 0%, #fffcf8 100%)' }}>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Clock size={24} /> My Lunch Time Calculator
          </h2>
          <p className="text-muted text-sm">
            Set your available break to get realistic food recommendations & wait estimates.
          </p>
        </div>
        {queueInfo && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm" style={{
            backgroundColor: queueInfo.delayClass === 'danger' ? '#fef2f2' : queueInfo.delayClass === 'warning' ? '#fffbeb' : '#f0fdf4',
            color: queueInfo.delayClass === 'danger' ? 'var(--danger)' : queueInfo.delayClass === 'warning' ? 'var(--warning)' : 'var(--success)',
            border: `1px solid ${queueInfo.delayClass === 'danger' ? '#fecaca' : queueInfo.delayClass === 'warning' ? '#fde68a' : '#bbf7d0'}`
          }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{
              backgroundColor: queueInfo.delayClass === 'danger' ? 'var(--danger)' : queueInfo.delayClass === 'warning' ? 'var(--warning)' : 'var(--success)'
            }}></span>
            Kitchen Queue Delay: {queueInfo.estimatedQueueDelay} mins ({queueInfo.delayLabel})
          </div>
        )}
      </div>

      {warning && (
        <div className="p-3 mb-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-sm flex items-center gap-2" style={{ backgroundColor: '#fffbe6', color: '#b45309', border: '1px solid #fde68a' }}>
          <AlertTriangle size={18} /> {warning}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {/* Step 1: Available Break Duration */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-muted">
            1. Select Break Duration (Minutes)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {presets.map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setBreakDuration(mins)}
                className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all"
                style={{
                  backgroundColor: breakDuration === mins && !nextClassTime ? 'var(--primary-color)' : '#f1f5f9',
                  color: breakDuration === mins && !nextClassTime ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {mins} mins
              </button>
            ))}
          </div>
          <input
            type="number"
            min="5"
            max="180"
            className="input-field text-sm"
            placeholder="Custom mins (e.g. 25)"
            value={breakDuration}
            onChange={(e) => {
              setBreakDuration(e.target.value);
            }}
          />
        </div>

        {/* Step 2: Next Class Time (Optional) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-muted">
            2. Next Class Time (Optional)
          </label>
          <input
            type="time"
            className="input-field text-sm mb-2"
            value={nextClassTime}
            onChange={(e) => setNextClassTime(e.target.value)}
          />
          {nextClassTime ? (
            <div className="text-xs text-primary font-semibold flex items-center gap-1">
              <CheckCircle size={14} /> Available time calculated from class schedule: <strong>{activeBreakMins} mins</strong>
            </div>
          ) : (
            <div className="text-xs text-muted">Calculates exact duration to your next class</div>
          )}
        </div>

        {/* Step 3: Max Budget (Optional) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-muted">
            3. Max Food Budget (₹ Optional)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              className="input-field text-sm"
              placeholder="e.g. 50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted mt-1">Filters meals fitting within your budget</div>
        </div>
      </div>

      {/* Summary Time Bar */}
      <div className="mt-6 p-4 rounded-xl flex justify-between items-center flex-wrap gap-4" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white rounded-lg border">
            <div className="text-xs text-muted uppercase font-bold">Available Break</div>
            <div className="text-xl font-bold text-primary">{activeBreakMins} mins</div>
          </div>
          <div className="text-center px-4 py-2 bg-white rounded-lg border">
            <div className="text-xs text-muted uppercase font-bold">Max Recommended Prep</div>
            <div className="text-xl font-bold text-slate-800">{recommendedMaxOrderTime} mins</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted font-medium">Estimated Pickup Buffer</div>
          <div className="text-sm font-semibold text-emerald-600" style={{ color: 'var(--success)' }}>
            Includes 3m walking + 5m eating time
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunchTimeCalculator;
