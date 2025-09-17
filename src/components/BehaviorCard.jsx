// src/components/BehaviorCard.jsx
import React from "react";
import { Plus, Minus, Check } from "lucide-react";

const BehaviorCard = ({
  behavior,
  onRecord,
  onCountChange,
  currentCount = 0,
  todayCount = 0,
  disabled = false,
}) => {
  const isGood = behavior.Type === "Good";
  const isRepeatable = behavior.IsRepeatable;
  const hasMaxLimit = behavior.MaxPerDay && behavior.MaxPerDay > 0;
  const isAtLimit = hasMaxLimit && todayCount >= behavior.MaxPerDay;
  const canPerform = !disabled && (!hasMaxLimit || !isAtLimit);
  const isDone = !isRepeatable && todayCount > 0;

  const handleAction = (action) => {
    if (isRepeatable) {
      onCountChange?.(behavior.Id, action === "increase" ? 1 : -1);
    } else {
      onRecord?.(behavior);
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 bg-white rounded-xl border transition-all duration-200
        ${
          canPerform && !isDone
            ? "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            : "border-gray-100 opacity-70"
        }
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

      {/* Today Status */}
      <div className="text-sm text-gray-500 flex-shrink-0 min-w-[60px] text-right">
        {isRepeatable
          ? hasMaxLimit
            ? `${todayCount}/${behavior.MaxPerDay}`
            : `${todayCount}×`
          : isDone
          ? "✓"
          : "○"}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0">
        {isRepeatable ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAction("decrease")}
              disabled={currentCount <= 0}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center transition-colors
                ${
                  currentCount > 0
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }
              `}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-700">
              {currentCount}
            </span>
            <button
              onClick={() => handleAction("increase")}
              disabled={!canPerform}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center transition-colors
                ${
                  canPerform
                    ? isGood
                      ? "bg-green-100 hover:bg-green-200 text-green-600"
                      : "bg-red-100 hover:bg-red-200 text-red-600"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }
              `}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleAction("record")}
            disabled={!canPerform || isDone}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${
                isDone
                  ? "bg-gray-100 text-green-600 cursor-default"
                  : canPerform
                  ? isGood
                    ? "bg-green-100 hover:bg-green-200 text-green-600"
                    : "bg-red-100 hover:bg-red-200 text-red-600"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            {isDone ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BehaviorCard;
