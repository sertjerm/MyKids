// src/components/BehaviorCard.jsx
import React from 'react';

const BehaviorCard = ({ behavior, onSelect, selected, disabled = false, showPoints = true }) => {
  const isGood = behavior.Type === 'Good';
  
  return (
    <div 
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        disabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed'
          : selected 
            ? `${isGood ? 'behavior-card-good' : 'behavior-card-bad'} border-purple-400 shadow-xl ring-4 ring-purple-100` 
            : `${isGood ? 'behavior-card-good' : 'behavior-card-bad'} hover:shadow-lg`
      }`}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div 
            className="w-6 h-6 rounded-full shadow-md ring-2 ring-white"
            style={{ backgroundColor: behavior.Color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{behavior.Name}</h3>
          <p className="text-sm text-gray-600 font-medium mb-1">{behavior.Category}</p>
          {behavior.Description && (
            <p className="text-xs text-gray-500 leading-relaxed">{behavior.Description}</p>
          )}
        </div>
        {showPoints && (
          <div className="flex-shrink-0">
            <div className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md ${
              isGood 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
            }`}>
              {isGood ? '+' : ''}{behavior.Points} คะแนน
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorCard;