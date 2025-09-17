// src/components/RewardItem.jsx
import React from "react";
import { Star, Gift } from "lucide-react";
// นำเข้าไฟล์ class ที่สร้างใหม่

const RewardItem = ({
  reward,
  currentPoints = 0,
  onRedeem,
  disabled = false,
}) => {
  if (!reward) return null;

  const cost = parseInt(reward.Cost || 0);
  const canAfford = currentPoints >= cost;

  const handleRedeem = () => {
    if (!disabled && canAfford) {
      onRedeem(reward);
    }
  };

  return (
    <div
      className={`card-bg-glass p-5 rounded-2xl border-2 transition-all duration-300 ${
        disabled
          ? "border-gray-200 opacity-50 cursor-not-allowed"
          : canAfford
          ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg"
          : "border-gray-200 opacity-75"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Gift
            className={`w-8 h-8 ${
              canAfford ? "text-orange-500" : "text-gray-400"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">
            {reward.Name}
          </h3>
          <p className="text-sm text-gray-600 font-medium mb-1">
            {reward.Category}
          </p>
          {reward.Description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {reward.Description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1 mb-2 ${
              canAfford
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Star className="w-3 h-3" />
            {reward.Cost} คะแนน
          </div>
          <button
            onClick={handleRedeem}
            disabled={disabled || !canAfford}
            className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
              canAfford && !disabled
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {disabled ? "กำลังแลก..." : canAfford ? "แลกรางวัล" : "คะแนนไม่พอ"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default RewardItem;
