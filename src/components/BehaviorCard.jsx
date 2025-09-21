// src/components/BehaviorCard.jsx
import React from "react";
import { Repeat, Lock } from "lucide-react";

const BehaviorCard = ({
  behavior,
  currentCount = 0,
  todayCount = 0,
  disabled = false,
  onSelect = () => {},
  showActions = false,
}) => {
  // รองรับทั้ง API response (lowercase) และ old format (uppercase)
  const name = behavior.name || behavior.Name;
  const points = behavior.points || behavior.Points;
  const type = behavior.type || behavior.Type;
  const category = behavior.category || behavior.Category;
  const color = behavior.color || behavior.Color;
  const isRepeatable = behavior.isRepeatable ?? behavior.IsRepeatable ?? true;

  const isGood = type === "Good";
  const hasMaxLimit = behavior.MaxPerDay && behavior.MaxPerDay > 0;

  return (
    <div
      className={`
        flex items-center gap-3 p-4 card-bg-glass rounded-xl border transition-all duration-200
        border-gray-200 ${disabled ? 'opacity-50' : 'hover:shadow-md cursor-pointer'}
      `}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      {/* Color Dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color || '#64748b' }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">
            {name}
          </h3>
          {category && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {category}
            </span>
          )}
        </div>
        
        {/* Show today count if provided */}
        {todayCount > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            วันนี้ทำแล้ว {todayCount} ครั้ง
          </div>
        )}
      </div>

      {/* Points */}
      <div
        className={`
          px-2 py-1 rounded text-sm font-medium flex-shrink-0
          ${isGood ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}
        `}
      >
        {isGood ? "+" : ""}
        {points}
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