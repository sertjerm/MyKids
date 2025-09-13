// src/pages/ChildDashboard.jsx
// แก้ไขปัญหา import และ export - ตรวจสอบ dependencies

import React, { useState, useCallback } from 'react';
import { Star, Gift, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// ตรวจสอบการ import hooks
import { 
  useChildDashboardData, 
  useActivityRecorder 
} from '../hooks/useApi';

// ตรวจสอบการ import ActivityDebugComponent
import ActivityDebugComponent from '../components/ActivityDebugComponent';

// Component หลัก
const ChildDashboard = ({ childId = "C001" }) => {
  const [showDebug, setShowDebug] = useState(false);
  const [notification, setNotification] = useState(null);

  console.log('🏁 ChildDashboard rendered with childId:', childId);

  // ใช้ hook ที่แก้ไขแล้ว
  const {
    children,
    goodBehaviors,
    badBehaviors,
    rewards,
    selectedChild,
    setSelectedChild,
    loading,
    error,
    refetchAll,
  } = useChildDashboardData(childId);

  console.log('📊 Dashboard data:', { 
    childrenCount: children?.length, 
    goodBehaviorsCount: goodBehaviors?.length,
    badBehaviorsCount: badBehaviors?.length,
    rewardsCount: rewards?.length,
    selectedChild: selectedChild?.name,
    loading,
    error 
  });

  // ใช้ hook สำหรับบันทึกกิจกรรม
  const { 
    recordActivity, 
    loading: recordingLoading, 
    error: recordingError,
    lastActivity,
    reset: resetRecording 
  } = useActivityRecorder(
    // onSuccess callback
    (result) => {
      console.log('✅ Activity recorded successfully:', result);
      setNotification({
        type: 'success',
        message: 'บันทึกกิจกรรมสำเร็จ!',
        data: result
      });
      refetchAll(); // รีเฟรชข้อมูลทั้งหมด
      
      // ซ่อน notification หลัง 3 วินาที
      setTimeout(() => setNotification(null), 3000);
    },
    // onError callback
    (error) => {
      console.error('❌ Activity recording failed:', error);
      setNotification({
        type: 'error',
        message: 'เกิดข้อผิดพลาด: ' + error.message,
        error: error
      });
      
      // ซ่อน notification หลัง 5 วินาที
      setTimeout(() => setNotification(null), 5000);
    }
  );

  // ฟังก์ชันบันทึกพฤติกรรม
  const handleBehaviorClick = useCallback(async (behavior) => {
    if (!selectedChild) {
      setNotification({
        type: 'error',
        message: 'กรุณาเลือกเด็กก่อน'
      });
      return;
    }

    try {
      console.log(`🎯 Recording behavior: ${behavior.name} for child: ${selectedChild.name}`);
      
      await recordActivity(selectedChild.id, behavior, 'behavior', 1, `บันทึกจาก Child Dashboard`);
      
    } catch (error) {
      console.error('❌ Failed to record behavior:', error);
    }
  }, [selectedChild, recordActivity]);

  // ฟังก์ชันบันทึกรางวัล
  const handleRewardClick = useCallback(async (reward) => {
    if (!selectedChild) {
      setNotification({
        type: 'error',
        message: 'กรุณาเลือกเด็กก่อน'
      });
      return;
    }

    // ตรวจสอบคะแนนเพียงพอ
    if (selectedChild.totalPoints < reward.cost) {
      setNotification({
        type: 'error',
        message: `คะแนนไม่เพียงพอ (ต้องการ ${reward.cost} คะแนน)`
      });
      return;
    }

    try {
      console.log(`🎁 Recording reward: ${reward.name} for child: ${selectedChild.name}`);
      
      await recordActivity(selectedChild.id, reward, 'reward', 1, `แลกรางวัล: ${reward.name}`);
      
    } catch (error) {
      console.error('❌ Failed to record reward:', error);
    }
  }, [selectedChild, recordActivity]);

  // Error boundary wrapper
  if (typeof useChildDashboardData !== 'function') {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Hook Import Error</h2>
          <p className="text-gray-600">
            ไม่สามารถโหลด useChildDashboardData hook ได้<br/>
            กรุณาตรวจสอบไฟล์ src/hooks/useApi.js
          </p>
        </div>
      </div>
    );
  }

  // แสดง Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูล...</p>
          <div className="mt-2 text-sm text-gray-500">
            กำลังโหลดเด็ก, พฤติกรรม และรางวัล...
          </div>
        </div>
      </div>
    );
  }

  // แสดง Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetchAll}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ตรวจสอบข้อมูลพื้นฐาน
  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">ไม่มีข้อมูลเด็ก</h2>
          <p className="text-gray-600 mb-4">
            ไม่พบข้อมูลเด็กในระบบ<br/>
            กรุณาเพิ่มข้อมูลเด็กก่อนใช้งาน
          </p>
          <button
            onClick={refetchAll}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            รีเฟรชข้อมูล
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        } flex items-center gap-3 max-w-md`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <div>
            <div className="font-medium">{notification.message}</div>
            {notification.data && (
              <div className="text-sm opacity-90">
                บันทึกเรียบร้อยแล้ว
              </div>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🌟 MyKids Dashboard 🌟
          </h1>
          
          {/* Child Selector */}
          {children.length > 0 && (
            <div className="mb-6">
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value);
                  setSelectedChild(child);
                  console.log('👶 Selected child:', child);
                }}
                className="bg-white border-2 border-purple-300 rounded-xl px-4 py-2 text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.totalPoints || 0} คะแนน)
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Child Info */}
          {selectedChild && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="text-6xl mb-4">{selectedChild.avatar}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedChild.name}
              </h2>
              <div className="flex justify-center gap-6 text-lg">
                <div className="bg-green-100 px-4 py-2 rounded-lg">
                  <span className="text-green-800 font-semibold">
                    คะแนนรวม: {selectedChild.totalPoints || 0}
                  </span>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                  <span className="text-blue-800 font-semibold">
                    อายุ: {selectedChild.age} ปี
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Good Behaviors */}
        {goodBehaviors && goodBehaviors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" />
              พฤติกรรมดี ({goodBehaviors.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goodBehaviors.map((behavior) => (
                <button
                  key={behavior.id}
                  onClick={() => handleBehaviorClick(behavior)}
                  disabled={recordingLoading}
                  className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    recordingLoading ? 'animate-pulse' : ''
                  }`}
                  style={{ borderLeft: `6px solid ${behavior.color || '#4ADE80'}` }}
                >
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="font-bold text-gray-800 mb-2">
                    {behavior.name}
                  </div>
                  <div className="text-green-600 font-semibold">
                    +{behavior.points} คะแนน
                  </div>
                  {behavior.category && (
                    <div className="text-xs text-gray-500 mt-1">
                      {behavior.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bad Behaviors */}
        {badBehaviors && badBehaviors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              พฤติกรรมไม่ดี ({badBehaviors.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badBehaviors.map((behavior) => (
                <button
                  key={behavior.id}
                  onClick={() => handleBehaviorClick(behavior)}
                  disabled={recordingLoading}
                  className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    recordingLoading ? 'animate-pulse' : ''
                  }`}
                  style={{ borderLeft: `6px solid ${behavior.color || '#EF4444'}` }}
                >
                  <div className="text-3xl mb-2">❌</div>
                  <div className="font-bold text-gray-800 mb-2">
                    {behavior.name}
                  </div>
                  <div className="text-red-600 font-semibold">
                    {behavior.points} คะแนน
                  </div>
                  {behavior.category && (
                    <div className="text-xs text-gray-500 mt-1">
                      {behavior.category}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rewards */}
        {rewards && rewards.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="text-purple-500" />
              รางวัล ({rewards.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rewards.map((reward) => {
                const canAfford = selectedChild && selectedChild.totalPoints >= reward.cost;
                
                return (
                  <button
                    key={reward.id}
                    onClick={() => handleRewardClick(reward)}
                    disabled={recordingLoading || !canAfford}
                    className={`bg-white rounded-xl shadow-lg p-4 transition-all duration-300 transform hover:scale-105 ${
                      canAfford 
                        ? 'hover:shadow-xl cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${recordingLoading ? 'animate-pulse' : ''}`}
                    style={{ borderLeft: `6px solid ${reward.color || '#A855F7'}` }}
                  >
                    <div className="text-3xl mb-2">🎁</div>
                    <div className="font-bold text-gray-800 mb-2">
                      {reward.name}
                    </div>
                    <div className={`font-semibold ${canAfford ? 'text-purple-600' : 'text-gray-400'}`}>
                      {reward.cost} คะแนน
                    </div>
                    {reward.category && (
                      <div className="text-xs text-gray-500 mt-1">
                        {reward.category}
                      </div>
                    )}
                    {!canAfford && selectedChild && (
                      <div className="text-xs text-red-500 mt-1">
                        ต้องการอีก {reward.cost - selectedChild.totalPoints} คะแนน
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Activity Info */}
        {lastActivity && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-700">
              <strong>กิจกรรมล่าสุด:</strong> {lastActivity.item.name} 
              {lastActivity.type === 'behavior' ? ' (พฤติกรรม)' : ' (รางวัล)'}
              <span className="ml-2 text-xs text-blue-500">
                {new Date(lastActivity.timestamp).toLocaleTimeString('th-TH')}
              </span>
            </div>
          </div>
        )}

        {/* Recording Status */}
        {recordingLoading && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-30">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>กำลังบันทึก...</span>
          </div>
        )}

        {/* Debug Panel - ตรวจสอบว่ามี ActivityDebugComponent หรือไม่ */}
        {ActivityDebugComponent && (
          <ActivityDebugComponent 
            isVisible={showDebug}
            onToggle={() => setShowDebug(!showDebug)}
          />
        )}
      </div>
    </div>
  );
};

// *** ตรวจสอบการ export ***
console.log('🔗 Exporting ChildDashboard component');

export default ChildDashboard;