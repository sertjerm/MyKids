import React from "react";
import { Star } from "lucide-react";

const PointsBadge = ({ points }) => {
  const isPositive = points >= 0;

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <Star className="w-4 h-4" />
      {points}
    </div>
  );
};

export default PointsBadge;
