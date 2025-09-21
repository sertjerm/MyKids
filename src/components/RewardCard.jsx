// src/components/RewardCard.jsx
import React from 'react';
import { Star, Gift, Lock } from 'lucide-react';

const RewardCard = ({ 
  reward, 
  onSelect = () => {}, 
  canAfford = true, 
  disabled = false, 
  showCost = true,
  currentPoints = 0,
}) => {
  // รองรับทั้ง API response (lowercase) และ old format (uppercase)
  const name = reward.name || reward.Name;
  const cost = reward.cost || reward.Cost;
  const category = reward.category || reward.Category;
  const description = reward.description || reward.Description;
  const color = reward.color || reward.Color;

  // คำนวณว่าแลกได้หรือไม่
  const actualCanAfford = currentPoints >= cost;
  const finalCanAfford = canAfford && actualCanAfford;

  return (
    <div 
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        disabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed'
          : finalCanAfford
            ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg'
            : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
      onClick={disabled ? undefined : () => onSelect(reward)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 relative">
          <Gift className={`w-8 h-8 ${finalCanAfford ? 'text-orange-500' : 'text-gray-400'}`} />
          
          {/* Lock icon for unaffordable rewards */}
          {!finalCanAfford && !disabled && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Lock className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{name}</h3>
          
          {category && (
            <p className="text-sm text-gray-600 font-medium mb-1">{category}</p>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          )}
          
          {/* Progress indicator */}
          {!finalCanAfford && currentPoints > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                ความคืบหน้า: {currentPoints}/{cost}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((currentPoints / cost) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {showCost && (
          <div className="flex-shrink-0">
            <div className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1 ${
              finalCanAfford 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              <Star className="w-3 h-3" />
              {cost} คะแนน
            </div>
          </div>
        )}
      </div>
      
      {/* Status message at bottom */}
      {!disabled && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-center">
            {finalCanAfford ? (
              <span className="text-green-600 font-medium">✨ แลกได้เลย!</span>
            ) : currentPoints === 0 ? (
              <span className="text-blue-600 font-medium">🎯 เริ่มสะสมคะแนนกันเถอะ</span>
            ) : (
              <span className="text-yellow-600 font-medium">
                💪 ใกล้แล้ว! อีก {cost - currentPoints} คะแนน
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardCard;