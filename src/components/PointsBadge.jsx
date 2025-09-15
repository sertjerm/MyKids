// src/components/PointsBadge.jsx
import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

const PointsBadge = ({ 
  points = 0, 
  size = 'md',
  showTrend = false,
  previousPoints = null,
  animated = false,
  className = ''
}) => {
  const trend = previousPoints !== null ? points - previousPoints : 0;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base', 
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5', 
    xl: 'h-6 w-6'
  };

  // Color scheme based on points value
  const getColorScheme = (pointValue) => {
    if (pointValue >= 100) {
      return {
        bg: 'from-purple-400 to-purple-600',
        text: 'text-white',
        icon: 'text-purple-100'
      };
    } else if (pointValue >= 50) {
      return {
        bg: 'from-blue-400 to-blue-600', 
        text: 'text-white',
        icon: 'text-blue-100'
      };
    } else if (pointValue >= 20) {
      return {
        bg: 'from-green-400 to-green-600',
        text: 'text-white', 
        icon: 'text-green-100'
      };
    } else if (pointValue >= 0) {
      return {
        bg: 'from-yellow-400 to-orange-500',
        text: 'text-white',
        icon: 'text-yellow-100'
      };
    } else {
      return {
        bg: 'from-red-400 to-red-600',
        text: 'text-white',
        icon: 'text-red-100'
      };
    }
  };

  const colorScheme = getColorScheme(points);

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full bg-gradient-to-r ${colorScheme.bg} ${sizeClasses[size]} shadow-md ${animated ? 'animate-pulse' : ''} ${className}`}>
      <Star className={`${iconSizes[size]} ${colorScheme.icon}`} />
      
      <span className={`font-bold ${colorScheme.text}`}>
        {points.toLocaleString()}
      </span>
      
      <span className={`${colorScheme.text} opacity-80`}>
        คะแนน
      </span>
      
      {showTrend && trend !== 0 && (
        <div className="flex items-center space-x-1">
          {trend > 0 ? (
            <TrendingUp className={`${iconSizes[size]} text-green-200`} />
          ) : (
            <TrendingDown className={`${iconSizes[size]} text-red-200`} />
          )}
          <span className={`text-xs ${colorScheme.text} opacity-75`}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        </div>
      )}
    </div>
  );
};

// Variant for just displaying points without styling
export const SimplePointsBadge = ({ points = 0, className = '' }) => {
  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <Star className="h-4 w-4 text-yellow-500" />
      <span className="font-semibold text-gray-700">
        {points.toLocaleString()}
      </span>
    </div>
  );
};

// Variant for compact display
export const CompactPointsBadge = ({ points = 0, className = '' }) => {
  return (
    <div className={`inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm ${className}`}>
      <Star className="h-3 w-3" />
      <span className="font-bold">{points}</span>
    </div>
  );
};

export default PointsBadge;