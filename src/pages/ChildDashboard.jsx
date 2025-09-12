// src/pages/ChildDashboard.jsx - Connected to Real API

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Gift, Plus, Minus, Save, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useChildDashboardData, useCreateActivity } from '../hooks/useApi';

const ChildDashboard = ({ childId: propChildId }) => {
  // ใช้ hook สำหรับดึงข้อมูลจาก API จริง
  const {
    children,
    selectedChild,
    setSelectedChild,
    goodBehaviors,
    badBehaviors,
    rewards,
    loading,
    error,
    refetchAll
  } = useChildDashboardData(propChildId);

  // Hook สำหรับบันทึกกิจกรรม
  const { createActivity, loading: saving, error: saveError } = useCreateActivity();

  // State สำหรับ UI
  const [activeTab, setActiveTab] = useState('good');
  const [behaviorCounts, setBehaviorCounts] = useState({});
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayDate] = useState(new Date().toLocaleDateString('th-TH'));

  // อัปเดตคะแนนเมื่อเลือกเด็กใหม่
  useEffect(() => {
    if (selectedChild) {
      setCurrentPoints(selectedChild.totalPoints || 0);
      setBehaviorCounts({}); // รีเซ็ตการนับพฤติกรรม
    }
  }, [selectedChild]);

  // ฟังก์ชันสำหรับอัปเดตจำนวนพฤติกรรม
  const updateBehaviorCount = (behaviorId, change) => {
    setBehaviorCounts(prev => {
      const newCount = Math.max(0, (prev[behaviorId] || 0) + change);
      
      // หาพฤติกรรมนี้เพื่อดูคะแนน
      const behavior = [...goodBehaviors, ...badBehaviors].find(b => b.id === behaviorId);
      
      if (behavior) {
        setCurrentPoints(prevPoints => prevPoints + (change * behavior.points));
      }
      
      return {
        ...prev,
        [behaviorId]: newCount
      };
    });
  };

  // ฟังก์ชันสำหรับบันทึกกิจกรรม
  const saveActivities = async () => {
    if (!selectedChild) {
      alert('กรุณาเลือกเด็กก่อน');
      return;
    }

    try {
      const activities = [];
      
      // สร้างรายการกิจกรรมที่จะบันทึก
      Object.entries(behaviorCounts).forEach(([behaviorId, count]) => {
        if (count > 0) {
          activities.push({
            childId: selectedChild.id,
            itemId: behaviorId,
            activityType: 'Behavior',
            count: count,
            note: `บันทึกจาก Child Dashboard`
          });
        }
      });

      if (activities.length === 0) {
        alert('ไม่มีกิจกรรมที่จะบันทึก');
        return;
      }

      // บันทึกทีละกิจกรรม
      for (const activity of activities) {
        await createActivity(activity);
      }

      alert(`บันทึกสำเร็จ ${activities.length} กิจกรรม!`);
      
      // รีเซ็ตการนับและรีเฟรชข้อมูล
      setBehaviorCounts({});
      refetchAll();
      
    } catch (error) {
      console.error('บันทึกกิจกรรมล้มเหลว:', error);
      alert('บันทึกล้มเหลว: ' + error.message);
    }
  };

  // แสดง Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แสดง Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center">
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

  // ไม่มีข้อมูลเด็ก
  if (!children.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีข้อมูลเด็ก</h2>
          <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูลเด็ก</p>
        </div>
      </div>
    );
  }

  // Component สำหรับแสดงเด็กแต่ละคน
  const ChildCard = ({ child, isSelected, onClick }) => (
    <div
      onClick={() => onClick(child)}
      className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-white shadow-lg border-2 border-purple-300 transform scale-105'
          : 'bg-white bg-opacity-70 hover:bg-opacity-90 hover:shadow-md'
      }`}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{child.avatar}</div>
        <div className="font-semibold text-gray-800">{child.name}</div>
        <div className="text-sm text-gray-600">{child.age} ขวบ</div>
        <div className="text-sm text-purple-600 font-bold">{child.totalPoints || 0} คะแนน</div>
      </div>
    </div>
  );

  // Component สำหรับแสดงพฤติกรรม
  const BehaviorItem = ({ behavior, count = 0 }) => {
    const isGood = behavior.points > 0;
    
    return (
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-lg gap-4 ${
        isGood ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-lg">
            {isGood ? '😊' : '😔'}
          </div>
          <div>
            <div className="font-medium text-gray-800">{behavior.name}</div>
            <div className={`text-sm font-semibold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
              {isGood ? '+' : ''}{behavior.points} คะแนน
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateBehaviorCount(behavior.id, -1)}
            disabled={count === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              count === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center font-semibold">{count}</span>
          
          <button
            onClick={() => updateBehaviorCount(behavior.id, 1)}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Component สำหรับแสดงรางวัล
  const RewardItem = ({ reward }) => {
    const canRedeem = currentPoints >= reward.cost;
    
    return (
      <div className={`p-4 rounded-xl border transition-all duration-300 ${
        canRedeem ? 'bg-yellow-50 border-yellow-200 hover:shadow-lg' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-800">{reward.name}</div>
            <div className="text-sm text-gray-600">{reward.cost} คะแนน</div>
          </div>
          <div className={`text-sm font-semibold ${canRedeem ? 'text-green-600' : 'text-gray-400'}`}>
            {canRedeem ? 'แลกได้' : 'คะแนนไม่พอ'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <span className="text-5xl">🌈</span>
            MyKids
          </h1>
          <p className="text-lg text-gray-600">วันนี้เป็นวันที่ {todayDate}</p>
        </div>

        {/* เลือกเด็ก */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              isSelected={selectedChild?.id === child.id}
              onClick={setSelectedChild}
            />
          ))}
        </div>

        {/* แสดงคะแนนของเด็กที่เลือก */}
        {selectedChild && (
          <div className="text-center mb-8 p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-2">{selectedChild.avatar}</div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedChild.name}</h2>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {currentPoints} คะแนน
            </div>
            <div className="text-sm text-gray-600">
              งานดี: {Object.values(behaviorCounts).reduce((sum, count) => sum + count, 0)} ครั้ง
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('good')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'good'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              งานดี ({goodBehaviors.length})
            </button>
            
            <button
              onClick={() => setActiveTab('bad')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'bad'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-700 hover:bg-red-50'
              }`}
            >
              <XCircle className="w-5 h-5" />
              พฤติกรรมไม่ดี ({badBehaviors.length})
            </button>
            
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'rewards'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-700 hover:bg-yellow-50'
              }`}
            >
              <Gift className="w-5 h-5" />
              รางวัล ({rewards.length})
            </button>
          </div>
        </div>

        {/* เนื้อหาตาม Tab */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {activeTab === 'good' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                งานดีที่ทำได้วันนี้
              </h3>
              <div className="space-y-4">
                {goodBehaviors.length > 0 ? (
                  goodBehaviors.map((behavior) => (
                    <BehaviorItem
                      key={behavior.id}
                      behavior={behavior}
                      count={behaviorCounts[behavior.id] || 0}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีงานดีในระบบ</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bad' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <XCircle className="text-red-500" />
                พฤติกรรมที่ควรหลีกเลี่ยง
              </h3>
              <div className="space-y-4">
                {badBehaviors.length > 0 ? (
                  badBehaviors.map((behavior) => (
                    <BehaviorItem
                      key={behavior.id}
                      behavior={behavior}
                      count={behaviorCounts[behavior.id] || 0}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีพฤติกรรมไม่ดีในระบบ</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Gift className="text-yellow-500" />
                รางวัลที่แลกได้
              </h3>
              <div className="space-y-4">
                {rewards.length > 0 ? (
                  rewards.map((reward) => (
                    <RewardItem
                      key={reward.id}
                      reward={reward}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีรางวัลในระบบ</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มบันทึก */}
        <div className="text-center">
          <button
            onClick={saveActivities}
            disabled={saving || Object.values(behaviorCounts).every(count => count === 0)}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 mx-auto ${
              saving || Object.values(behaviorCounts).every(count => count === 0)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                บันทึกใหม่
              </>
            )}
          </button>
          
          {saveError && (
            <p className="text-red-600 mt-2">บันทึกล้มเหลว: {saveError}</p>
          )}
        </div>

        {/* ข้อมูลการเชื่อมต่อ */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500 bg-white bg-opacity-70 rounded-lg p-4">
            ความคืบหน้าการเก็บข้อมูลของ {selectedChild?.name}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className="text-xs mt-1">0% เสร็จแล้ว</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;