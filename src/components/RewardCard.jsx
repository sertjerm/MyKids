// src/components/RewardCard.jsx
import React from 'react';
import { Star, Gift } from 'lucide-react';

const RewardCard = ({ reward, onSelect, canAfford = true, disabled = false, showCost = true }) => {
  return (
    <div 
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        disabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed'
          : canAfford
            ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg'
            : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
      onClick={disabled ? undefined : () => onSelect(reward)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Gift className={`w-8 h-8 ${canAfford ? 'text-orange-500' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{reward.Name}</h3>
          <p className="text-sm text-gray-600 font-medium mb-1">{reward.Category}</p>
          {reward.Description && (
            <p className="text-xs text-gray-500 leading-relaxed">{reward.Description}</p>
          )}
        </div>
        {showCost && (
          <div className="flex-shrink-0">
            <div className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1 ${
              canAfford 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              <Star className="w-3 h-3" />
              {reward.Cost} คะแนน
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardCard;