// src/pages/FamilyLogin.jsx
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react";
import api from "../services/api";

// Avatar component (optional, can be removed if not used)
const Avatar = ({ src, alt, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-md ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            alt
          )}&background=random&color=fff&size=150`;
        }}
      />
    </div>
  );
};

// Input field with icon and password toggle
const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  showPassword,
  onTogglePassword,
  required = false,
}) => (
  <div className="space-y-1">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type === "password" && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full pl-10 pr-10 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all duration-200 ${
          error ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
        }`}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

const FamilyLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-hide notification after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน";

    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const family = await api.loginFamily(formData.email, formData.password);
      setLoading(false);

      if (family && family.id) {
        setNotification({
          message: `ยินดีต้อนรับครอบครัว ${family.name}!`,
          type: "success",
        });

        // รอสักครู่แล้วค่อย redirect เพื่อให้เห็น success message
        setTimeout(() => {
          if (onLogin) onLogin(family);
        }, 1500);
      } else {
        setNotification({
          message: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
          type: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);

      // จัดการ error message ให้เป็นภาษาไทย
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

      if (error.message.includes("not found")) {
        errorMessage = "ไม่พบอีเมลนี้ในระบบ";
      } else if (error.message.includes("Invalid email or password")) {
        errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      } else if (error.message.includes("inactive")) {
        errorMessage = "บัญชีนี้ถูกระงับการใช้งาน";
      } else if (
        error.message.includes("network") ||
        error.message.includes("timeout")
      ) {
        errorMessage =
          "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      }

      setNotification({ message: errorMessage, type: "error" });
    }
  };

  // Auto submit after setting data
  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);

    try {
      const family = await api.loginFamily(email, password);
      setLoading(false);

      if (family && family.id) {
        setNotification({
          message: `ยินดีต้อนรับครอบครัว ${family.name}!`,
          type: "success",
        });

        setTimeout(() => {
          if (onLogin) onLogin(family);
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      console.error("Quick login error:", error);
      setNotification({
        message: "ไม่สามารถเข้าสู่ระบบได้",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 flex items-center justify-center p-4">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-md transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-400 text-white"
              : "bg-red-400 text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <Heart className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-white text-red-400 flex items-center justify-center text-sm font-bold">
                !
              </div>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="card-bg-glass max-w-md mx-auto mt-16 p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-300 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              MyKids Tracker
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">เข้าสู่ระบบ</h2>
          <p className="text-gray-600">เข้าสู่ระบบเพื่อจัดการพฤติกรรมของลูก</p>
        </div>

        <form
          className="card-bg-glass rounded-3xl shadow-lg p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <InputField
            type="email"
            placeholder="อีเมลของคุณ"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            icon={Mail}
            error={errors.email}
            required
          />
          <InputField
            type="password"
            placeholder="รหัสผ่าน"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            icon={Lock}
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-300 to-purple-300 text-white py-3 px-4 rounded-2xl font-medium hover:from-pink-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังเข้าสู่ระบบ...</span>
              </div>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            บัญชีทดสอบ
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleQuickLogin("smith@example.com", "password")}
              className="w-full bg-gradient-to-r from-blue-200 to-purple-200 text-gray-800 py-2 px-4 rounded-xl hover:from-blue-300 hover:to-purple-300 transition-all duration-200 text-sm"
            >
              👨‍👩‍👧‍👦 ครอบครัวสมิท (smith@example.com)
            </button>
            <button
              onClick={() =>
                handleQuickLogin("johnson@example.com", "password")
              }
              className="w-full bg-gradient-to-r from-green-200 to-blue-200 text-gray-800 py-2 px-4 rounded-xl hover:from-green-300 hover:to-blue-300 transition-all duration-200 text-sm"
            >
              👨‍👩‍👧‍👦 ครอบครัวจอห์นสัน (johnson@example.com)
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            รหัสผ่าน: password
          </p>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 MyKids Tracker</p>
          <p>จัดการพฤติกรรมของลูกด้วยรักและความเข้าใจ</p>
        </div>
      </div>
    </div>
  );
};

export default FamilyLogin;
