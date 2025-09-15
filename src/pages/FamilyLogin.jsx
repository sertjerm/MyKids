import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import api from '../services/api';

// Avatar component (optional, can be removed if not used)
const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-md ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff&size=150`;
        }}
      />
    </div>
  );
};

// Input field with icon and password toggle
const InputField = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  showPassword,
  onTogglePassword,
  required = false
}) => (
  <div className="space-y-1">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full pl-10 pr-10 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
        }`}
      />
      {type === 'password' && (
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
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'กรุณากรอกอีเมล';
    if (!formData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const family = await api.loginFamily(formData.email, formData.password);
      setLoading(false);
      if (family && family.id) {
        setNotification({ message: `ยินดีต้อนรับ ${family.name}!`, type: 'success' });
        if (onLogin) onLogin(family);
      } else {
        setNotification({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', type: 'error' });
      }
    } catch (error) {
      setLoading(false);
      setNotification({ message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 flex items-center justify-center p-4">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-md transform transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-green-300 text-white'
            : 'bg-red-300 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      <div className="max-w-md w-full">
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
        <form className="bg-white rounded-3xl shadow-lg p-8 space-y-6" onSubmit={handleSubmit}>
          <InputField
            type="email"
            placeholder="อีเมลของคุณ"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={Mail}
            error={errors.email}
            required
          />
          <InputField
            type="password"
            placeholder="รหัสผ่าน"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={Lock}
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-300 to-purple-300 text-white py-3 px-4 rounded-2xl font-medium hover:from-pink-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-md"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 MyKids Tracker</p>
          <p>จัดการพฤติกรรมของลูกด้วยรักและความเข้าใจ</p>
        </div>
      </div>
    </div>
  );
};

export default FamilyLogin;