// src/components/rewards/RewardsList.jsx
// Rewards List Component using updated API
import React, { useState, useEffect } from "react";
import {
  getRewards,
  getCurrentPoints,
  checkCanRedeemReward,
  recordActivity,
} from "../../services/api.js";

const RewardCard = ({
  reward,
  canRedeem,
  onRedeem,
  loading,
  currentPoints,
}) => (
  <div
    className={`
    card-bg-glass rounded-2xl shadow-lg p-4 border-2 transition-all duration-200
    ${
      canRedeem
        ? "border-transparent hover:shadow-xl"
        : "border-gray-200 opacity-60"
    }
  `}
  >
    <div className="text-center">
      <div className="text-4xl mb-3">{reward.ImagePath}</div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">{reward.Name}</h3>

      {reward.Description && (
        <p className="text-gray-600 text-sm mb-3">{reward.Description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {reward.Category}
        </span>
        <span className="font-bold text-lg text-purple-600">
          {reward.Cost} คะแนน
        </span>
      </div>

      <button
        onClick={() => onRedeem(reward)}
        disabled={!canRedeem || loading}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${
            canRedeem && !loading
              ? "bg-purple-500 hover:bg-purple-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {loading
          ? "กำลังแลก..."
          : canRedeem
          ? "แลกรางวัล"
          : `ต้องการอีก ${reward.Cost - currentPoints} คะแนน`}
      </button>
    </div>
  </div>
);
export default RewardCard;
