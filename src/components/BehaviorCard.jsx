// src/components/BehaviorCard.jsx
import React from "react";
import { Repeat, Lock } from "lucide-react";

const BehaviorCard = ({
  behavior,
  currentCount = 0,
  todayCount = 0,
  disabled = false,
}) => {
  const isGood = behavior.Type === "Good";
  const isRepeatable = behavior.IsRepeatable;
  const hasMaxLimit = behavior.MaxPerDay && behavior.MaxPerDay > 0;

  return (
    <div
      className={`
        flex items-center gap-3 p-4 card-bg-glass rounded-xl border transition-all duration-200
        border-gray-200
      `}
    >
      {/* Color Dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: behavior.Color }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">
            {behavior.Name}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {behavior.Category}
          </span>
        </div>
      </div>

      {/* Points */}
      <div
        className={`
          px-2 py-1 rounded text-sm font-medium flex-shrink-0
          ${isGood ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}
        `}
      >
        {isGood ? "+" : ""}
        {behavior.Points}
      </div>

      {/* Repeatable/Not Repeatable Indicator */}
      <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
        {isRepeatable ? (
          <>
            <Repeat className="w-4 h-4" />
            <span>ทำซ้ำได้</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>ทำได้ครั้งเดียว/วัน</span>
          </>
        )}
      </div>
    </div>
  );
};

export default BehaviorCard;
