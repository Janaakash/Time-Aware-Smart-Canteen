import React from 'react';
import { useLunchTime } from '../context/LunchTimeContext';
import { useCart } from '../context/CartContext';
import { Sparkles, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const RecommendedFoods = () => {
  const { recommendationData, loading } = useLunchTime();
  const { addToCart } = useCart();

  if (loading && !recommendationData) {
    return <div className="p-4 text-center text-muted">Calculating smart meal recommendations...</div>;
  }

  if (!recommendationData) return null;

  const { recommendations, suitableCount, noMatchMessage, breakInfo } = recommendationData;
  const breakMins = breakInfo?.availableBreakMins || 15;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
            <Sparkles size={24} /> Recommended for Your Break ({breakMins} Mins)
          </h2>
          <p className="text-muted text-sm">
            Meals selected based on prep time, current queue workload, and your budget.
          </p>
        </div>
      </div>

      {noMatchMessage && (
        <div className="card p-6 text-center bg-amber-50 border-amber-200 text-amber-900 mb-6" style={{ backgroundColor: '#fffbe6', borderColor: '#fde68a' }}>
          <AlertTriangle size={32} className="mx-auto mb-2 text-warning" />
          <h3 className="font-bold text-lg mb-1">No Suitable Meals Found</h3>
          <p className="text-sm max-w-lg mx-auto text-muted">{noMatchMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {recommendations.slice(0, 4).map(food => {
          const isFit = food.fitStatus === 'FIT';
          const isTight = food.fitStatus === 'TIGHT';

          return (
            <div 
              key={food._id} 
              className="card flex flex-col h-full relative"
              style={{
                border: food.isRecommended ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                boxShadow: food.isRecommended ? '0 4px 12px rgba(249, 115, 22, 0.15)' : 'var(--shadow-sm)'
              }}
            >
              {food.isRecommended && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow z-10 flex items-center gap-1" style={{ backgroundColor: 'var(--primary-color)' }}>
                  <Sparkles size={12} /> BEST MATCH
                </div>
              )}

              <img src={food.image} alt={food.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />

              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{food.name}</h3>
                  <span className="text-primary font-bold text-lg">₹{food.price}</span>
                </div>

                {/* Timing breakdown */}
                <div className="p-2.5 rounded-lg mb-3 text-xs" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted">Prep Time:</span>
                    <span className="font-semibold">{food.prepTime} mins</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted">Queue Delay:</span>
                    <span className="font-semibold">{food.queueDelay} mins</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t font-bold text-slate-800">
                    <span>Total Collection Time:</span>
                    <span style={{ color: isFit ? 'var(--success)' : isTight ? 'var(--warning)' : 'var(--danger)' }}>
                      ~{food.collectionTimeMins} mins
                    </span>
                  </div>
                </div>

                {/* Recommendation explanation */}
                <div className="text-xs mb-4 p-2 rounded" style={{
                  backgroundColor: isFit ? '#f0fdf4' : isTight ? '#fffbeb' : '#fef2f2',
                  color: isFit ? '#166534' : isTight ? '#b45309' : '#991b1b',
                  border: `1px solid ${isFit ? '#bbf7d0' : isTight ? '#fde68a' : '#fecaca'}`
                }}>
                  <div className="font-semibold mb-0.5">{food.fitLabel}</div>
                  <div>{food.explanation}</div>
                </div>

                <div className="mt-auto">
                  <button 
                    className="btn-primary w-full text-sm py-2"
                    onClick={() => addToCart(food)}
                    disabled={!food.available}
                  >
                    {food.available ? `Add to Cart (₹${food.price})` : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedFoods;
