// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Users, Star, Gift, BarChart3, Settings, LogOut } from "lucide-react";
import Avatar from "./Avatar";
import BehaviorCard from "./BehaviorCard";
import RewardCard from "./RewardCard";
import PointsBadge from "./PointsBadge";
import api from "../services/api";

// Admin Dashboard - ใช้ design เดิม แต่เปลี่ยนจาก mockData เป็น API
const AdminDashboard = ({ family, onLogout, onSelectChild }) => {
  const [activeTab, setActiveTab] = useState('children');
  const [familyData, setFamilyData] = useState({ children: [], totalPoints: 0 });
  const [familyBehaviors, setFamilyBehaviors] = useState([]);
  const [familyRewards, setFamilyRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, [family.id]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      
      // ใช้ API แทน mockData
      const [children, behaviors, rewards] = await Promise.all([
        api.getChildren(family.id),
        api.getBehaviors(family.id),
        api.getRewards(family.id)
      ]);
      
      // ประมวลผลข้อมูลเด็กและคะแนน (ใช้ข้อมูลจาก API response)
      const processedChildren = family.children || children || [];
      const totalPoints = processedChildren.reduce((sum, child) => sum + (child.currentPoints || 0), 0);
      
      setFamilyData({ children: processedChildren, totalPoints });
      setFamilyBehaviors(behaviors || []);
      setFamilyRewards(rewards || []);
      
    } catch (error) {
      console.error('Error loading family data:', error);
      // Fallback ใช้ข้อมูลที่มีจาก login
      setFamilyData({ 
        children: family.children || [], 
        totalPoints: (family.children || []).reduce((sum, child) => sum + (child.currentPoints || 0), 0)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      {/* Main Container with max-width */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar emoji={family.avatarPath} size="lg" />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{family.name}</h1>
                <p className="text-sm sm:text-base text-gray-600">{family.email}</p>
                <p className="text-xs sm:text-sm text-gray-500">{family.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {familyData.totalPoints}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">คะแนนรวม</p>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {familyData.children.length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">เด็ก</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 sm:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl card-shadow mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'children', label: 'เด็ก', icon: Users },
              { id: 'behaviors', label: 'พฤติกรรม', icon: Star },
              { id: 'rewards', label: 'รางวัล', icon: Gift },
              { id: 'reports', label: 'รายงาน', icon: BarChart3 },
              { id: 'settings', label: 'ตั้งค่า', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl card-shadow p-4 sm:p-6">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && activeTab === 'children' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">จัดการเด็ก</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {familyData.children.map(child => (
                  <div key={child.id || child.Id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar emoji={child.avatarPath || child.AvatarPath} size="md" />
                        <div className="text-center sm:text-left min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{child.name || child.Name}</h3>
                          <p className="text-sm text-gray-600">อายุ {child.age || child.Age} ปี • {(child.gender || child.Gender) === 'M' ? 'ชาย' : 'หญิง'}</p>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            เข้าร่วมเมื่อ {new Date(child.createdAt || child.CreatedAt || Date.now()).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <PointsBadge points={child.currentPoints || 0} />
                        <button
                          onClick={() => onSelectChild(child)}
                          className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base whitespace-nowrap"
                        >
                          เข้าใช้งาน
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'behaviors' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">พฤติกรรม</h2>
              
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-green-600 mb-3 sm:mb-4">
                  พฤติกรรมดี ({familyBehaviors.filter(b => b.Type === 'Good').length} รายการ)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {familyBehaviors.filter(b => b.Type === 'Good').map(behavior => (
                    <BehaviorCard key={behavior.Id} behavior={behavior} onSelect={() => {}} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-3 sm:mb-4">
                  พฤติกรรมไม่ดี ({familyBehaviors.filter(b => b.Type === 'Bad').length} รายการ)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {familyBehaviors.filter(b => b.Type === 'Bad').map(behavior => (
                    <BehaviorCard key={behavior.Id} behavior={behavior} onSelect={() => {}} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'rewards' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">รางวัล</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {familyRewards.map(reward => (
                  <RewardCard key={reward.Id} reward={reward} onSelect={() => {}} />
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'reports' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">รายงาน</h2>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">รายงานจะพร้อมใช้งานเร็วๆ นี้</p>
              </div>
            </div>
          )}

          {!loading && activeTab === 'settings' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">ตั้งค่า</h2>
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">การตั้งค่าจะพร้อมใช้งานเร็วๆ นี้</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;