// src/components/admin/AdminDashboard.jsx - ปรับปรุงใช้ API ใหม่

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Gift, Plus, Edit, Trash2, 
  RefreshCw, AlertCircle, Loader2 
} from 'lucide-react';

// Import API ใหม่
import api, { API_CONFIG } from '../../services/api.js';

const AdminDashboard = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activeTab, setActiveTab] = useState('children');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalChildren: 0,
    goodBehaviors: 0,
    badBehaviors: 0,
    totalRewards: 0
  });

  // โหลดข้อมูลทั้งหมด
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading admin dashboard data...');

      // โหลดข้อมูลพร้อมกัน
      const [
        dashboardResponse,
        childrenResponse,
        goodBehaviorsResponse,
        badBehaviorsResponse,
        rewardsResponse
      ] = await Promise.all([
        api.dashboard.getSummary(),
        api.children.getAll(),
        api.behaviors.getGood(),
        api.behaviors.getBad(),
        api.rewards.getAll()
      ]);

      console.log('📊 API responses:', {
        dashboard: dashboardResponse,
        children: childrenResponse,
        goodBehaviors: goodBehaviorsResponse,
        badBehaviors: badBehaviorsResponse,
        rewards: rewardsResponse
      });

      // แปลงข้อมูลให้เป็น format ที่ frontend ใช้
      const transformedChildren = Array.isArray(childrenResponse) 
        ? childrenResponse.map(api.utils.transformChild)
        : [];

      const transformedGoodBehaviors = Array.isArray(goodBehaviorsResponse)
        ? goodBehaviorsResponse.map(api.utils.transformBehavior)
        : [];

      const transformedBadBehaviors = Array.isArray(badBehaviorsResponse)
        ? badBehaviorsResponse.map(api.utils.transformBehavior)
        : [];

      const transformedRewards = Array.isArray(rewardsResponse)
        ? rewardsResponse.map(api.utils.transformReward)
        : [];

      // ตั้งค่าข้อมูลที่แปลงแล้ว
      setDashboardData({
        ...dashboardResponse,
        children: transformedChildren
      });
      setGoodBehaviors(transformedGoodBehaviors);
      setBadBehaviors(transformedBadBehaviors);
      setRewards(transformedRewards);

      // อัปเดตสถิติ
      setStats({
        totalChildren: transformedChildren.length,
        goodBehaviors: transformedGoodBehaviors.length,
        badBehaviors: transformedBadBehaviors.length,
        totalRewards: transformedRewards.length
      });

      console.log('✅ Admin dashboard data loaded successfully');

    } catch (err) {
      console.error('❌ Error loading admin dashboard data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshData = async () => {
    await loadAllData();
  };

  // Component สำหรับการ์ดสถิติ
  const StatCard = ({ icon, title, value, color }) => (
    <div className={`${color} rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
    </div>
  );

  // Component สำหรับปุ่ม Tab
  const TabButton = ({ id, label, icon, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      } border border-blue-200`}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  // Component สำหรับแสดงข้อมูลเด็ก
  const ChildCard = ({ child }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{child.avatar}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
            <p className="text-gray-600">{child.age} ขวบ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">คะแนนวันนี้:</span>
          <span className="font-semibold text-blue-600">{child.todayPoints || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">คะแนนทั้งหมด:</span>
          <span className="font-semibold text-purple-600">{child.totalPoints || 0}</span>
        </div>
      </div>
    </div>
  );

  // Component สำหรับแสดงพฤติกรรม
  const BehaviorCard = ({ behavior, type }) => (
    <div className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-l-4 ${
      type === 'good' ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg">
            {type === 'good' ? '😊' : '😔'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{behavior.name}</h4>
            <p className={`text-sm font-semibold ${
              type === 'good' ? 'text-green-600' : 'text-red-600'
            }`}>
              {behavior.points > 0 ? '+' : ''}{behavior.points} คะแนน
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
            <Edit className="w-3 h-3" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  // Component สำหรับแสดงรางวัล
  const RewardCard = ({ reward }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg">🎁</div>
          <div>
            <h4 className="font-semibold text-gray-800">{reward.name}</h4>
            <p className="text-sm font-semibold text-purple-600">
              {reward.cost} คะแนน
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
            <Edit className="w-3 h-3" />
          </button>
          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูล Admin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={refreshData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-700 mb-2">
            🔧 ระบบจัดการ Admin
          </h1>
          <p className="text-gray-600">จัดการข้อมูลเด็ก พฤติกรรม และรางวัล</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            icon={<Users className="w-8 lg:w-12 h-8 lg:h-12 text-blue-500" />}
            title="ลูกทั้งหมด"
            value={stats.totalChildren}
            color="bg-blue-100"
          />
          <StatCard
            icon={<CheckCircle className="w-8 lg:w-12 h-8 lg:h-12 text-green-500" />}
            title="งานดี"
            value={stats.goodBehaviors}
            color="bg-green-100"
          />
          <StatCard
            icon={<XCircle className="w-8 lg:w-12 h-8 lg:h-12 text-red-500" />}
            title="พฤติกรรมไม่ดี"
            value={stats.badBehaviors}
            color="bg-red-100"
          />
          <StatCard
            icon={<Gift className="w-8 lg:w-12 h-8 lg:h-12 text-purple-500" />}
            title="รางวัล"
            value={stats.totalRewards}
            color="bg-purple-100"
          />
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🎛️ ควบคุมระบบ</h2>
            <button 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรชข้อมูล
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            <TabButton
              id="children"
              label="จัดการเด็ก"
              icon={<Users className="w-4 h-4" />}
              isActive={activeTab === 'children'}
              onClick={setActiveTab}
              count={stats.totalChildren}
            />
            <TabButton
              id="good-behaviors"
              label="งานดี"
              icon={<CheckCircle className="w-4 h-4" />}
              isActive={activeTab === 'good-behaviors'}
              onClick={setActiveTab}
              count={stats.goodBehaviors}
            />
            <TabButton
              id="bad-behaviors"
              label="พฤติกรรมไม่ดี"
              icon={<XCircle className="w-4 h-4" />}
              isActive={activeTab === 'bad-behaviors'}
              onClick={setActiveTab}
              count={stats.badBehaviors}
            />
            <TabButton
              id="rewards"
              label="รางวัล"
              icon={<Gift className="w-4 h-4" />}
              isActive={activeTab === 'rewards'}
              onClick={setActiveTab}
              count={stats.totalRewards}
            />
          </div>

          {/* Tab Content */}
          <div>
            {/* Children Tab */}
            {activeTab === 'children' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" />
                    จัดการข้อมูลลูก
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    เพิ่มลูกใหม่
                  </button>
                </div>

                {dashboardData?.children && dashboardData.children.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.children.map((child) => (
                      <ChildCard key={child.id} child={child} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ยังไม่มีข้อมูลเด็กในระบบ</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      เพิ่มเด็กคนแรก
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Good Behaviors Tab */}
            {activeTab === 'good-behaviors' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="text-green-600" />
                    จัดการงานดี
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    เพิ่มงานดีใหม่
                  </button>
                </div>

                {goodBehaviors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goodBehaviors.map((behavior) => (
                      <BehaviorCard key={behavior.id} behavior={behavior} type="good" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ยังไม่มีงานดีในระบบ</p>
                  </div>
                )}
              </div>
            )}

            {/* Bad Behaviors Tab */}
            {activeTab === 'bad-behaviors' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <XCircle className="text-red-600" />
                    จัดการพฤติกรรมไม่ดี
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    เพิ่มพฤติกรรมไม่ดี
                  </button>
                </div>

                {badBehaviors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badBehaviors.map((behavior) => (
                      <BehaviorCard key={behavior.id} behavior={behavior} type="bad" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ยังไม่มีพฤติกรรมไม่ดีในระบบ</p>
                  </div>
                )}
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Gift className="text-purple-600" />
                    จัดการรางวัล
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    เพิ่มรางวัลใหม่
                  </button>
                </div>

                {rewards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map((reward) => (
                      <RewardCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">ยังไม่มีรางวัลในระบบ</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📊 สถิติระบบ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>API Status: <span className="text-green-600 font-semibold">เชื่อมต่อแล้ว</span></div>
              <div>Database: <span className="text-green-600 font-semibold">{dashboardData?.database || 'connected'}</span></div>
              <div>Version: <span className="text-blue-600 font-semibold">v3.2.0</span></div>
              <div>Last Update: <span className="text-gray-500">{new Date().toLocaleTimeString('th-TH')}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;