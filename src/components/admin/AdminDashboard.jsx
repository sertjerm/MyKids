// src/components/admin/AdminDashboard.jsx - Connected to Real API

import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Gift, Plus, Edit, Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminDashboardData, useCreateChild } from '../../hooks/useApi';

const AdminDashboard = () => {
  const {
    dashboardData,
    goodBehaviors,
    badBehaviors,
    rewards,
    stats,
    loading,
    error,
    refetchAll
  } = useAdminDashboardData();

  const { createChild, loading: creatingChild, error: createChildError } = useCreateChild();

  const [activeTab, setActiveTab] = useState('children');
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: '',
    age: '',
    avatarPath: '👶'
  });

  // ฟังก์ชันสำหรับสร้างเด็กใหม่
  const handleAddChild = async (e) => {
    e.preventDefault();
    
    if (!newChildData.name.trim()) {
      alert('กรุณาใส่ชื่อเด็ก');
      return;
    }

    try {
      await createChild({
        name: newChildData.name.trim(),
        age: parseInt(newChildData.age) || null,
        avatarPath: newChildData.avatarPath
      });

      alert('เพิ่มเด็กใหม่สำเร็จ!');
      setShowAddChildModal(false);
      setNewChildData({ name: '', age: '', avatarPath: '👶' });
      refetchAll();
    } catch (error) {
      console.error('เพิ่มเด็กล้มเหลว:', error);
      alert('เพิ่มเด็กล้มเหลว: ' + error.message);
    }
  };

  // แสดง Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูล Admin...</p>
        </div>
      </div>
    );
  }

  // แสดง Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">ขัดข้องในการโหลดข้อมูล</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetchAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // Component สำหรับแสดงสถิติ
  const StatCard = ({ icon, title, value, color }) => (
    <div className={`card-pastel ${color} transform hover:scale-105 transition-all duration-300 p-6 rounded-xl shadow-lg bg-white`}>
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );

  // Component สำหรับ Tab buttons
  const TabButton = ({ id, label, icon, isActive, onClick, count = 0 }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      } first:rounded-l-lg last:rounded-r-lg border border-blue-200`}
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
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
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
    <div className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 ${
      type === 'good' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
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
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Component สำหรับแสดงรางวัล
  const RewardCard = ({ reward }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg">🎁</div>
          <div>
            <h4 className="font-semibold text-gray-800">{reward.name}</h4>
            <p className="text-sm font-semibold text-yellow-600">{reward.cost} คะแนน</p>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-5xl">⚙️</span>
              ระบบจัดการ Admin
            </h1>
            <p className="text-gray-600 mt-2">จัดการข้อมูลเด็ก พฤติกรรม และรางวัล</p>
          </div>
          <button 
            onClick={refetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="ลูกทั้งหมด"
            value={stats.totalChildren}
            color="border-blue-200"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8 text-green-600" />}
            title="งานดี"
            value={stats.goodBehaviors}
            color="border-green-200"
          />
          <StatCard
            icon={<XCircle className="w-8 h-8 text-red-600" />}
            title="พฤติกรรมไม่ดี"
            value={stats.badBehaviors}
            color="border-red-200"
          />
          <StatCard
            icon={<Gift className="w-8 h-8 text-purple-600" />}
            title="รางวัล"
            value={stats.totalRewards}
            color="border-purple-200"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
            <TabButton
              id="children"
              label="จัดการลูก"
              icon={<Users className="w-5 h-5" />}
              isActive={activeTab === 'children'}
              onClick={setActiveTab}
              count={stats.totalChildren}
            />
            <TabButton
              id="good-behaviors"
              label="งานดี"
              icon={<CheckCircle className="w-5 h-5" />}
              isActive={activeTab === 'good-behaviors'}
              onClick={setActiveTab}
              count={stats.goodBehaviors}
            />
            <TabButton
              id="bad-behaviors"
              label="พฤติกรรมไม่ดี"
              icon={<XCircle className="w-5 h-5" />}
              isActive={activeTab === 'bad-behaviors'}
              onClick={setActiveTab}
              count={stats.badBehaviors}
            />
            <TabButton
              id="rewards"
              label="รางวัล"
              icon={<Gift className="w-5 h-5" />}
              isActive={activeTab === 'rewards'}
              onClick={setActiveTab}
              count={stats.totalRewards}
            />
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Children Tab */}
          {activeTab === 'children' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-blue-600" />
                  จัดการข้อมูลลูก
                </h2>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
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
                  <button
                    onClick={() => setShowAddChildModal(true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
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
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="text-green-600" />
                  จัดการงานดี
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  เพิ่มงานดีใหม่
                </button>
              </div>

              {goodBehaviors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <XCircle className="text-red-600" />
                  จัดการพฤติกรรมไม่ดี
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  เพิ่มพฤติกรรมไม่ดี
                </button>
              </div>

              {badBehaviors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Gift className="text-purple-600" />
                  จัดการรางวัล
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  เพิ่มรางวัลใหม่
                </button>
              </div>

              {rewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Add Child Modal */}
        {showAddChildModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">เพิ่มเด็กใหม่</h3>
              
              <form onSubmit={handleAddChild}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      value={newChildData.name}
                      onChange={(e) => setNewChildData({...newChildData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ชื่อของเด็ก"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อายุ
                    </label>
                    <input
                      type="number"
                      value={newChildData.age}
                      onChange={(e) => setNewChildData({...newChildData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="อายุ (ปี)"
                      min="1"
                      max="18"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อวตาร
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['👶', '👦', '👧', '🧒', '👤'].map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setNewChildData({...newChildData, avatarPath: avatar})}
                          className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                            newChildData.avatarPath === avatar
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {createChildError && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-600 text-sm">{createChildError}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddChildModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={creatingChild}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
                  >
                    {creatingChild ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        กำลังเพิ่ม...
                      </>
                    ) : (
                      'เพิ่มเด็ก'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500 bg-white bg-opacity-70 rounded-lg p-4">
            🔗 เชื่อมต่อกับฐานข้อมูลจริง - {dashboardData?.database || 'ไม่ทราบสถานะ'}
            <br />
            📅 ข้อมูล ณ วันที่ {dashboardData?.date || new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;