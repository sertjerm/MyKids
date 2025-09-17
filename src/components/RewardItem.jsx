// src/components/RewardItem.jsx
import React from 'react';

const RewardItem = ({ 
  reward, 
  currentPoints = 0,
  onRedeem, 
  disabled = false 
}) => {
  // Add null/undefined checks
  if (!reward) {
    return null;
  }

  const cost = parseInt(reward.Cost || 0);
  const canAfford = currentPoints >= cost;

  const handleRedeem = () => {
    if (!disabled && canAfford) {
      onRedeem(reward);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: reward.Color || "#FFE4E1" }}
          />
          
          {/* Reward info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800">{reward.Name}</div>
            <div className="text-sm text-gray-500">{reward.Description}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Cost */}
          <div className="font-bold text-lg text-purple-600">
            {cost} คะแนน
          </div>
          
          {/* Redeem button */}
          <button
            onClick={handleRedeem}
            disabled={disabled || !canAfford}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canAfford && !disabled
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {disabled 
              ? 'กำลังแลก...' 
              : canAfford 
                ? 'แลกรางวัล' 
                : 'คะแนนไม่พอ'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardItem;