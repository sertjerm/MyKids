// src/components/behaviors/BehaviorsList.jsx
// Behaviors List Component using updated API
import React, { useState, useEffect } from 'react';
import { getBehaviors, recordActivity, checkCanPerformBehavior } from '../../services/api.js';

const BehaviorCard = ({ behavior, canPerform, onRecord, loading }) => {
  const isGood = behavior.Type === 'Good';
  
  return (
    <div className={`
      bg-white rounded-2xl shadow-lg p-4 border-2 transition-all duration-200
      ${canPerform ? 'border-transparent hover:shadow-xl' : 'border-gray-200 opacity-60'}
    `}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-lg">{behavior.Name}</h3>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: behavior.Color }}
        />
      </div>
      
      {behavior.Description && (
        <p className="text-gray-600 text-sm mb-3">{behavior.Description}</p>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {behavior.Category}
        </span>
        <span className={`font-bold text-lg ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {isGood ? '+' : '-'}{Math.abs(behavior.Points)} คะแนน
        </span>
      </div>
      
      {behavior.MaxPerDay && (
        <div className="text-xs text-gray-500 mb-3">
          ทำได้สูงสุด {behavior.MaxPerDay} ครั้ง/วัน
        </div>
      )}
      
      <button
        onClick={() => onRecord(behavior)}
        disabled={!canPerform || loading}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${canPerform && !loading
            ? `${isGood 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }`
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {loading ? 'กำลังบันทึก...' : canPerform ? 'บันทึก' : 'ทำแล้ววันนี้'}
      </button>
    </div>
  );
};

export default BehaviorCard;
