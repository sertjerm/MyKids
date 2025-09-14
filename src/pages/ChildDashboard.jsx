// src/pages/ChildDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, Gift, AlertCircle, CheckCircle, RefreshCw, 
  XCircle, Users, Award, Activity, Repeat, Plus, Minus 
} from 'lucide-react';

const ChildDashboard = ({ childId = "C001" }) => {
  const [activeTab, setActiveTab] = useState('good-behaviors');
  const [children, setChildren] = useState([]);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [recordingLoading, setRecordingLoading] = useState(false);

  // API Base URL
  const API_URL = 'https://sertjerm.com/my-kids-api/api.php';

  // โหลดข้อมูลทั้งหมด
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading child dashboard data...');

      const [
        childrenRes,
        goodBehaviorsRes,
        badBehaviorsRes,
        rewardsRes
      ] = await Promise.all([
        fetch(`${API_URL}?children`),
        fetch(`${API_URL}?good-behaviors`),
        fetch(`${API_URL}?bad-behaviors`),
        fetch(`${API_URL}?rewards`)
      ]);

      const [
        childrenData,
        goodBehaviorsData,
        badBehaviorsData,
        rewardsData
      ] = await Promise.all([
        childrenRes.json(),
        goodBehaviorsRes.json(),
        badBehaviorsRes.json(),
        rewardsRes.json()
      ]);

      console.log('📊 Child dashboard data loaded:', {
        children: childrenData,
        goodBehaviors: goodBehaviorsData,
        badBehaviors: badBehaviorsData,
        rewards: rewardsData
      });

      // แปลงข้อมูลเป็นรูปแบบที่ใช้งาน
      setChildren(Array.isArray(childrenData) ? childrenData.map(child => ({
        id: child.Id,
        name: child.Name,
        age: child.Age,
        avatar: child.AvatarPath || '👧',
        totalPoints: 0 // จะคำนวณจาก API อื่น
      })) : []);

      setGoodBehaviors(Array.isArray(goodBehaviorsData) ? goodBehaviorsData.map(behavior => ({
        id: behavior.Id,
        name: behavior.Name,
        points: behavior.Points,
        color: behavior.Color,
        category: behavior.Category,
        isRepeatable: behavior.IsRepeatable
      })) : []);

      setBadBehaviors(Array.isArray(badBehaviorsData) ? badBehaviorsData.map(behavior => ({
        id: behavior.Id,
        name: behavior.Name,
        points: behavior.Points,
        color: behavior.Color,
        category: behavior.Category,
        isRepeatable: behavior.IsRepeatable
      })) : []);

      setRewards(Array.isArray(rewardsData) ? rewardsData.map(reward => ({
        id: reward.Id,
        name: reward.Name,
        cost: reward.Cost,
        color: reward.Color,
        category: reward.Category
      })) : []);

      // เลือกเด็กคนแรกเป็นค่าเริ่มต้น
      if (childrenData && childrenData.length > 0) {
        const firstChild = {
          id: childrenData[0].Id,
          name: childrenData[0].Name,
          age: childrenData[0].Age,
          avatar: childrenData[0].AvatarPath || '👧',
          totalPoints: 0
        };
        setSelectedChild(firstChild);
      }

    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // บันทึกกิจกรรม
  const recordActivity = async (childId, item, type, count = 1, note = '') => {
    try {
      setRecordingLoading(true);
      
      const activityData = {
        ChildId: childId,
        ItemId: item.id,
        ActivityType: type === 'reward' ? 'Reward' : (item.points > 0 ? 'Good' : 'Bad'),
        Count: count,
        EarnedPoints: type === 'reward' ? -item.cost : (item.points * count),
        Note: note || `บันทึกจาก Child Dashboard`,
        ActivityDate: new Date().toISOString().split('T')[0]
      };

      console.log('🎯 Recording activity:', activityData);

      const response = await fetch(`${API_URL}?activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: `บันทึก${type === 'reward' ? 'รางวัล' : 'พฤติกรรม'}สำเร็จ!`,
          details: `${item.name} ${type === 'reward' ? `(-${item.cost} คะแนน)` : `(+${item.points} คะแนน)`}`
        });
        
        // อัปเดตคะแนนเด็ก
        if (selectedChild) {
          setSelectedChild(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + (type === 'reward' ? -item.cost : item.points)
          }));
        }
      } else {
        throw new Error(result.error || 'บันทึกไม่สำเร็จ');
      }

    } catch (error) {
      console.error('❌ Recording failed:', error);
      setNotification({
        type: 'error',
        message: 'เกิดข้อผิดพลาด: ' + error.message
      });
    } finally {
      setRecordingLoading(false);
      
      // ซ่อน notification หลัง 3 วินาที
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle behavior click
  const handleBehaviorClick = useCallback(async (behavior) => {
    if (!selectedChild) {
      setNotification({
        type: 'error',
        message: 'กรุณาเลือกเด็กก่อน'
      });
      return;
    }

    await recordActivity(selectedChild.id, behavior, 'behavior', 1);
  }, [selectedChild]);

  // Handle reward click
  const handleRewardClick = useCallback(async (reward) => {
    if (!selectedChild) {
      setNotification({
        type: 'error',
        message: 'กรุณาเลือกเด็กก่อน'
      });
      return;
    }

    if (selectedChild.totalPoints < reward.cost) {
      setNotification({
        type: 'error',
        message: `คะแนนไม่เพียงพอ (ต้องการ ${reward.cost} คะแนน)`
      });
      return;
    }

    await recordActivity(selectedChild.id, reward, 'reward', 1);
  }, [selectedChild]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-purple-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <div className="flex-1">
            <div className="font-medium">{notification.message}</div>
            {notification.details && (
              <div className="text-sm opacity-90">{notification.details}</div>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🌟 MyKids - หน้าเด็ก 🌟
          </h1>
          
          {/* Child Selector */}
          {children.length > 0 && (
            <div className="mb-6">
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value);
                  setSelectedChild(child);
                }}
                className="bg-white border-2 border-purple-300 rounded-xl px-4 py-2 text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">เลือกเด็ก (0 คะแนน)</option>
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

        {/* Tab Navigation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-purple-200">
          <nav className="flex space-x-1">
            {[
              { id: 'good-behaviors', label: 'พฤติกรรมดี', icon: CheckCircle, count: goodBehaviors.length, color: 'text-green-600' },
              { id: 'bad-behaviors', label: 'พฤติกรรมไม่ดี', icon: XCircle, count: badBehaviors.length, color: 'text-red-600' },
              { id: 'rewards', label: 'รางวัล', icon: Gift, count: rewards.length, color: 'text-purple-600' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-[1.02]'
                      : `${tab.color} hover:bg-purple-100/50`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-8">
          {/* Good Behaviors Tab */}
          {activeTab === 'good-behaviors' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                พฤติกรรมดี - กดเพื่อบันทึก ({goodBehaviors.length} รายการ)
              </h3>
              
              {goodBehaviors.length > 0 ? (
                <div className="space-y-2">
                  {goodBehaviors.map((behavior) => (
                    <button
                      key={behavior.id}
                      onClick={() => handleBehaviorClick(behavior)}
                      disabled={recordingLoading || !selectedChild}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Left Side */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-gray-800">{behavior.name}</h4>
                          <p className="text-sm text-gray-600">{behavior.category || 'ทั่วไป'}</p>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-green-600">+{behavior.points}</span>
                          </div>
                          <span className="text-xs text-gray-500">คะแนน</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {behavior.isRepeatable ? (
                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                              <Repeat className="w-3 h-3" />
                              <span>ทำซ้ำได้</span>
                            </div>
                          ) : (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                              ครั้งเดียว
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ไม่มีพฤติกรรมดี</p>
                </div>
              )}
            </div>
          )}

          {/* Bad Behaviors Tab */}
          {activeTab === 'bad-behaviors' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                พฤติกรรมไม่ดี - กดเพื่อบันทึก ({badBehaviors.length} รายการ)
              </h3>
              
              {badBehaviors.length > 0 ? (
                <div className="space-y-2">
                  {badBehaviors.map((behavior) => (
                    <button
                      key={behavior.id}
                      onClick={() => handleBehaviorClick(behavior)}
                      disabled={recordingLoading || !selectedChild}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Left Side */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-gray-800">{behavior.name}</h4>
                          <p className="text-sm text-gray-600">{behavior.category || 'ทั่วไป'}</p>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Minus className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-red-600">{behavior.points}</span>
                          </div>
                          <span className="text-xs text-gray-500">คะแนน</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {behavior.isRepeatable ? (
                            <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                              <Repeat className="w-3 h-3" />
                              <span>ทำซ้ำได้</span>
                            </div>
                          ) : (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                              ครั้งเดียว
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ไม่มีพฤติกรรมไม่ดี</p>
                </div>
              )}
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-500" />
                รางวัล - กดเพื่อแลก ({rewards.length} รายการ)
              </h3>
              
              {rewards.length > 0 ? (
                <div className="space-y-2">
                  {rewards.map((reward) => {
                    const canAfford = selectedChild && selectedChild.totalPoints >= reward.cost;
                    
                    return (
                      <button
                        key={reward.id}
                        onClick={() => handleRewardClick(reward)}
                        disabled={recordingLoading || !canAfford || !selectedChild}
                        className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400 transition-all ${
                          canAfford && selectedChild
                            ? 'hover:shadow-md cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Left Side */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Gift className="w-5 h-5 text-purple-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-gray-800">{reward.name}</h4>
                            <p className="text-sm text-gray-600">{reward.category || 'ทั่วไป'}</p>
                            {!canAfford && selectedChild && (
                              <p className="text-xs text-red-500 mt-1">
                                ต้องการอีก {reward.cost - selectedChild.totalPoints} คะแนน
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Side */}
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Gift className="w-4 h-4 text-purple-500" />
                            <span className={`font-bold ${canAfford ? 'text-purple-600' : 'text-gray-400'}`}>
                              {reward.cost}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">คะแนน</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ไม่มีรางวัล</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recording Status */}
        {recordingLoading && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-30">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>กำลังบันทึก...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildDashboard;