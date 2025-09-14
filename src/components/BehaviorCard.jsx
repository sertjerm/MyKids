import React from "react";

const BehaviorCard = ({
  behavior,
  onSelect,
  selected,
  disabled = false,
  showPoints = true,
}) => {
  const isGood = behavior.Type === "Good";

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200
        ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-green-50"
        }
        ${selected ? "border-green-400 shadow" : "border-gray-200"}
      `}
      onClick={disabled ? undefined : () => onSelect(behavior)}
      style={{ minHeight: 48 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: behavior.Color }}
        />
        <div className="font-semibold truncate">{behavior.Name}</div>
        <div className="text-xs text-gray-500 truncate">
          {behavior.Category}
        </div>
        {behavior.MaxPerDay && (
          <div className="text-xs text-blue-500 ml-2">
            ทำได้ {behavior.MaxPerDay} ครั้ง/วัน
          </div>
        )}
      </div>
      {showPoints && (
        <div
          className={`px-2 py-1 rounded-lg text-sm font-bold ${
            isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isGood ? "+" : ""}
          {behavior.Points}
        </div>
      )}
    </div>
  );
};

export default BehaviorCard;
