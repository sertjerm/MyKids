// src/components/BehaviorItem.jsx
import React from "react";
import { Plus, Minus, Square, CheckSquare } from "lucide-react";

const BehaviorItem = ({
  behavior,
  count = 0,
  onCountChange,
  onToggle,
  disabled = false,
}) => {
  const isRepeatable = behavior.IsRepeatable === "1";
  const points = parseInt(behavior.Points);
  const isGoodBehavior = behavior.Type === "Good";

  const handleDecrement = () => {
    if (!disabled && count > 0) {
      onCountChange(behavior.Id, -1); // ✅ ส่ง delta -1
    }
  };

  const handleIncrement = () => {
    if (!disabled) {
      onCountChange(behavior.Id, +1); // ✅ ส่ง delta +1
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      onToggle(behavior.Id);
    }
  };

  // Dynamic colors based on behavior type
  const colorScheme = {
    good: {
      points: "text-green-600",
      button: "bg-green-100 hover:bg-green-200 text-green-600",
      checkbox: {
        checked: "text-green-600 hover:text-green-700 hover:bg-green-50",
        unchecked: "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
      },
    },
    bad: {
      points: "text-red-600",
      button: "bg-red-100 hover:bg-red-200 text-red-600",
      checkbox: {
        checked: "text-red-600 hover:text-red-700 hover:bg-red-50",
        unchecked: "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
      },
    },
  };

  const colors = colorScheme[isGoodBehavior ? "good" : "bad"];

  return (
    <div className="card-bg-glass rounded-xl p-4 shadow-sm border-2 border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: behavior.Color || "#A78BFA" }}
          />

          {/* Behavior info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800">{behavior.Name}</div>
            <div className="text-sm text-gray-500">{behavior.Description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Points */}
          <div className={`font-bold text-lg ${colors.points}`}>
            {points > 0 ? "+" : ""}
            {points}
          </div>

          {/* Today's count with 'x' - เฉพาะพฤติกรรมที่ทำซ้ำได้ */}
          {isRepeatable && (
            <div className="text-gray-500 text-sm">{count}x</div>
          )}

          {/* Control buttons - แยกตาม IsRepeatable */}
          {isRepeatable ? (
            // สำหรับพฤติกรรมที่ทำซ้ำได้ - ใช้ปุ่ม +/-
            <div className="flex items-center gap-1">
              <button
                onClick={handleDecrement}
                disabled={disabled || count === 0}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-gray-600 transition-colors"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={handleIncrement}
                disabled={disabled}
                className={`w-8 h-8 ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            // สำหรับพฤติกรรมที่ทำได้ครั้งเดียว - ใช้ checkbox
            <button
              onClick={handleToggle}
              disabled={disabled}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                count > 0 ? colors.checkbox.checked : colors.checkbox.unchecked
              }`}
            >
              {count > 0 ? <CheckSquare size={32} /> : <Square size={32} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BehaviorItem;
