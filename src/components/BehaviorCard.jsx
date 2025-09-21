// src/components/BehaviorCard.jsx
import React from "react";
import { Repeat, Lock, Star, Zap } from "lucide-react";

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
        p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 relative overflow-hidden
        ${disabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed' 
          : isGood
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl hover:shadow-green-100/50'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-xl hover:shadow-red-100/50'
        }
      `}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 ${
        isGood ? 'bg-green-400' : 'bg-red-400'
      }`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          {/* Icon/Color indicator - ขยายใหญ่และสวยขึ้น */}
          <div className="flex-shrink-0 relative">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isGood 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-br from-red-400 to-pink-500'
              }`}
              style={{ backgroundColor: color || (isGood ? '#10B981' : '#EF4444') }}
            >
              {isGood ? (
                <Star className="w-6 h-6 text-white" />
              ) : (
                <Zap className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Indicator badge */}
            {!isRepeatable && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {name}
              </h3>
              
              {category && (
                <p className="text-sm text-gray-600 font-medium mt-1">{category}</p>
              )}
            </div>

            {/* Show today count if provided */}
            {todayCount > 0 && (
              <div className="text-sm text-gray-500 mb-2">
                วันนี้ทำแล้ว {todayCount} ครั้ง
              </div>
            )}

            {/* Repeatable status */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isRepeatable 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {isRepeatable ? (
                  <>
                    <Repeat className="w-3 h-3" />
                    <span>ทำซ้ำได้</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>ทำได้ครั้งเดียว/วัน</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Points - เหมือน RewardCard */}
          <div className="flex-shrink-0">
            <div className={`px-4 py-3 rounded-xl text-base font-bold shadow-md flex items-center gap-2 ${
              isGood 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
            }`}>
              <Star className="w-4 h-4" />
              <span>{isGood ? "+" : ""}{Math.abs(points)} คะแนน</span>
            </div>
          </div>
        </div>

        {/* Status message at bottom - เหมือน RewardCard */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-center">
            {disabled ? (
              <span className="text-gray-500 font-medium">ไม่สามารถใช้งานได้</span>
            ) : isGood ? (
              <span className="text-green-600 font-medium">⭐ ทำดีได้คะแนน!</span>
            ) : (
              <span className="text-red-600 font-medium">⚠️ ระวังคะแนนลด!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorCard;