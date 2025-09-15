// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Users, Award, Star, TrendingUp } from 'lucide-react';
import api from '../services/api';

// Avatar Component
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

// ChildCard Component
const ChildCard = ({ child, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(child)}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-2 border-transparent hover:border-pink-200"
    >
      <div className="text-center">
        <Avatar 
          src={child.avatarPath} 
          alt={child.name} 
          size="lg"
          className="mx-auto mb-4"
        />
        <h3 className="text-xl font-bold text-gray-800 mb-2">{child.name}</h3>
        <p className="text-gray-600 mb-4">อายุ {child.age} ปี</p>
        
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3">
          <div className="flex items-center justify-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-bold text-gray-800">{child.currentPoints || 0}</span>
            <span className="text-sm text-gray-600">คะแนน</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component  
const StatCard = ({ icon: Icon, title, value, color }) => {
  return (
    <div className={`${color} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-white/80" />
      </div>
    </div>
  );
};

const AdminDashboard = ({ family, onLogout, onSelectChild }) => {
  const [children, setChildren] = useState(family.children || []);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Refresh children data
  const refreshChildren = async () => {
    try {
      setLoading(true);
      const updatedChildren = await api.getChildren(family.id);
      setChildren(updatedChildren);
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing children:', error);
      setLoading(false);
      setNotification({
        message: 'ไม่สามารถโหลดข้อมูลเด็กได้',
        type: 'error'
      });
    }
  };

  const totalPoints = children.reduce((sum, child) => sum + (child.currentPoints || 0), 0);
  const totalChildren = children.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-md transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Avatar 
                src={family.avatarPath} 
                alt={family.name} 
                size="md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {family.name}
                </h1>
                <p className="text-gray-600">{family.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshChildren}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'โหลด...' : 'รีเฟรช'}
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Users}
            title="จำนวนเด็ก"
            value={totalChildren}
            color="bg-gradient-to-r from-blue-400 to-blue-600"
          />
          <StatCard 
            icon={Star}
            title="คะแนนรวม"
            value={totalPoints}
            color="bg-gradient-to-r from-yellow-400 to-orange-500"
          />
          <StatCard 
            icon={TrendingUp}
            title="ครอบครัวที่ดี"
            value="100%"
            color="bg-gradient-to-r from-green-400 to-green-600"
          />
        </div>

        {/* Children Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">เด็กในครอบครัว</h2>
            <button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg">
              <Plus className="h-5 w-5" />
              <span>เพิ่มเด็ก</span>
            </button>
          </div>

          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildCard 
                  key={child.id}
                  child={child}
                  onSelect={onSelectChild}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                ยังไม่มีเด็กในครอบครัว
              </h3>
              <p className="text-gray-500 mb-6">
                เริ่มต้นด้วยการเพิ่มเด็กคนแรกของคุณ
              </p>
              <button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all duration-200">
                เพิ่มเด็กเลย
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">การกระทำด่วน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 p-4 rounded-xl hover:from-blue-200 hover:to-blue-300 transition-all duration-200">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">จัดการเด็ก</span>
            </button>
            <button className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 p-4 rounded-xl hover:from-green-200 hover:to-green-300 transition-all duration-200">
              <Star className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">พฤติกรรมดี</span>
            </button>
            <button className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 p-4 rounded-xl hover:from-red-200 hover:to-red-300 transition-all duration-200">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">พฤติกรรมไม่ดี</span>
            </button>
            <button className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 p-4 rounded-xl hover:from-yellow-200 hover:to-yellow-300 transition-all duration-200">
              <Award className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">รางวัล</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;