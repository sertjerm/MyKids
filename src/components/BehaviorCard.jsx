import React from "react";
import { Plus, Minus } from "lucide-react";

const BehaviorCard = ({
  behavior,
  count = null,
  onIncrement,
  onDecrement,
  selected,
  disabled = false,
  showPoints = true,
}) => {
  const isGood = behavior.Type === "Good";

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
        disabled
          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
          : "bg-white hover:shadow-md"
      } ${
        isGood
          ? "border-green-200 hover:bg-green-50"
          : "border-red-200 hover:bg-red-50"
      } ${selected || (count !== null && count > 0) ? "ring-2 ring-purple-300 shadow-md" : "shadow"}`}
      style={{ minHeight: 48 }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: behavior.Color }}
        />
        <div className="font-semibold truncate text-gray-800">{behavior.Name}</div>
        <div className="text-xs text-gray-500 truncate hidden sm:block">
          {behavior.Category}
        </div>
        {behavior.MaxPerDay && (
          <div className="text-xs text-blue-500 ml-2 hidden md:block">
            ทำได้ {behavior.MaxPerDay} ครั้ง/วัน
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        {showPoints && (
          <div
            className={`px-2 py-1 rounded-lg text-sm font-bold flex-shrink-0 ${
              isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isGood ? "+" : ""}
            {behavior.Points}
          </div>
        )}
        
        {count !== null && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDecrement?.(behavior.Id)}
              disabled={count === 0 || disabled}
              className="p-1 rounded-full bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3 text-red-600" />
            </button>
            
            <div className="min-w-[2rem] text-center">
              <span className="text-lg font-bold text-gray-800">{count}</span>
            </div>
            
            <button
              onClick={() => onIncrement?.(behavior.Id)}
              disabled={disabled}
              className="p-1 rounded-full bg-green-100 hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3 h-3 text-green-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehaviorCard;