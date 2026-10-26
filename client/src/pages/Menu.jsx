import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useLunchTime } from '../context/LunchTimeContext';
import LunchTimeCalculator from '../components/LunchTimeCalculator';
import RecommendedFoods from '../components/RecommendedFoods';
import { Clock } from 'lucide-react';

import { API_BASE_URL } from '../config/api';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { queueInfo } = useLunchTime();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/foods`);
        setFoods(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch foods');
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  if (loading) return <div className="text-center p-6">Loading Menu & Time Estimates...</div>;

  const categories = [...new Set(foods.map(f => f.category))];
  const queueDelay = queueInfo?.estimatedQueueDelay || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Feature One: Lunch Time Calculator */}
      <LunchTimeCalculator />

      {/* Feature Two: Smart Meal Recommendation */}
      <RecommendedFoods />

      <h1 className="text-3xl font-bold mb-6 text-primary border-b pb-2">Full Canteen Menu</h1>
      
      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="mb-4 text-2xl font-bold" style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>{category}</h2>
          <div className="grid grid-cols-4 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {foods.filter(f => f.category === category).map(food => {
              const prep = food.prepTime || 5;
              const estCollection = queueDelay + prep + 1;

              return (
                <div key={food._id} className="card flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={food.image} alt={food.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                      <Clock size={12} /> Prep: {prep} mins
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold">{food.name}</h3>
                    <div className="flex justify-between items-center mt-2 mb-3">
                      <div className="text-primary font-bold text-xl">₹{food.price}</div>
                      <div className="text-xs text-muted">Est. Total: ~{estCollection}m</div>
                    </div>
                    <div className="mt-auto">
                      <button 
                        className="btn-primary w-full text-sm"
                        onClick={() => addToCart(food)}
                        disabled={!food.available}
                      >
                        {food.available ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;
