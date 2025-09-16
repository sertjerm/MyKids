// src/components/PointsBadge.jsx
import React from 'react';
import { Star } from 'lucide-react';

const PointsBadge = ({ points = 0, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', 
    lg: 'px-4 py-2 text-base'
  };

  // ใช้สีตามจำนวนคะแนน
  const getColorClass = (pointValue) => {
    if (pointValue >= 100) {
      return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
    } else if (pointValue >= 50) {
      return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    } else if (pointValue >= 20) {
      return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    } else if (pointValue >= 0) {
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    } else {
      return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-md ${sizeClasses[size]} ${getColorClass(points)} ${className}`}>
      <Star className="w-3 h-3" />
      <span>{points}</span>
    </div>
  );
};

export default PointsBadge;