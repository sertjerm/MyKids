// src/components/Avatar.jsx
import React, { useState } from "react";
import { User } from "lucide-react";

// Fallback avatar component
const FallbackAvatar = ({ size }) => (
  <div
    className={`${size} rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden`}
  >
    <User className="w-1/2 h-1/2 text-gray-400" />
  </div>
);

// Image avatar component
const ImageAvatar = ({ src, alt, size, onError }) => (
  <div
    className={`${size} rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden`}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={onError}
    />
  </div>
);

const Avatar = ({ src, alt, size = "md", emoji }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  // ไม่มี path หรือ image error = แสดง fallback
  if (!emoji || imageError) {
    return <FallbackAvatar size={sizeClasses[size]} />;
  }

  // มี path = แสดง image
  return (
    <ImageAvatar
      src={emoji}
      alt={alt}
      size={sizeClasses[size]}
      onError={handleImageError}
    />
  );
};

export default Avatar;
