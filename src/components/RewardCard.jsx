import React from "react";
import { Star } from "lucide-react";

const RewardCard = ({
  reward,
  onSelect,
  disabled = false,
  childPoints = 0,
}) => {
  const canAfford = childPoints >= reward.Cost;
  const actuallyDisabled = disabled || !canAfford;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200
        ${
          actuallyDisabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-purple-50"
        }
        ${canAfford ? "border-purple-400 shadow" : "border-gray-200"}
      `}
      onClick={actuallyDisabled ? undefined : () => onSelect(reward)}
      style={{ minHeight: 48 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-6 h-6 rounded-xl bg-purple-100 flex items-center justify-center">
          {reward.ImagePath}
        </div>
        <div className="font-semibold truncate">{reward.Name}</div>
        <div className="text-xs text-gray-500 truncate">{reward.Category}</div>
      </div>
      <div
        className={`px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${
          canAfford
            ? "bg-purple-100 text-purple-700"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <Star className="w-4 h-4" />
        {reward.Cost}
      </div>
    </div>
  );
};

export default RewardCard;
