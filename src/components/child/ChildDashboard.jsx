// src/components/child/ChildDashboard.jsx - ปรับปรุงใช้ API ใหม่

import React, { useState, useEffect } from 'react';
import { 
  Save, RefreshCw, AlertCircle, Plus, Minus, 
  Star, Trophy, Gift, Heart, Loader2 
} from 'lucide-react';

// Import API ใหม่
import api, { API_CONFIG } from '../../services/api.js';

const ChildDashboard = ({ childId }) => {
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [behaviorCounts, setBehaviorCounts] = useState({});
  const [error, setError] = useState(null);

  // โหลดข้อมูลทั้งหมด
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading child dashboard data...');

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

      console.log('📊 Child API responses:', {
        dashboard: dashboardResponse,
        children: childrenResponse,
        goodBehaviors: goodBehaviorsResponse,
        badBehaviors: badBehaviorsResponse,
        rewards: rewardsResponse
      });

      // แปลงข้อมูลให้เป็น format ที่ frontend ใช้
      const transformedChildren = Array.isArray(childrenResponse)
        ? childrenResponse.map(api.utils.transformChild)
        : dashboardResponse?.children?.map(api.utils.transformChild) || [];

      const transformedGoodBehaviors = Array.isArray(goodBehaviorsResponse)
        ? goodBehaviorsResponse.map(api.utils.transformBehavior)
        : [];

      const transformedBadBehaviors = Array.isArray(badBehaviorsResponse)
        ? badBehaviorsResponse.map(api.utils.transformBehavior)
        : [];

      const transformedRewards = Array.isArray(rewardsResponse)
        ? rewardsResponse.map(api.utils.transformReward)
        : [];

      // ตั้งค่าข้อมูล
      setChildren(transformedChildren);
      setGoodBehaviors(transformedGoodBehaviors);
      setBadBehaviors(transformedBadBehaviors);
      setRewards(transformedRewards);

      // เลือกเด็ก - ถ้ามี childId ที่ส่งมาให้เลือก หรือเลือกคนแรก
      const targetChild = childId 
        ? transformedChildren.find(c => c.id === childId)
        : transformedChildren[0];
      
      if (targetChild) {
        setSelectedChild(targetChild);
      }

      console.log('✅ Child dashboard data loaded successfully');

    } catch (err) {
      console.error('❌ Error loading child dashboard data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadInitialData();
  }, [childId]);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshData = async () => {
    await loadInitialData();
    setBehaviorCounts({}); // รีเซ็ตการนับ
  };

  // อัปเดตจำนวนพฤติกรรม
  const updateBehaviorCount = (behaviorId, delta) => {
    setBehaviorCounts(prev => {
      const currentCount = prev[behaviorId] || 0;
      const newCount = Math.max(0, currentCount + delta);
      return {
        ...prev,
        [behaviorId]: newCount,
      };
    });
  };

  // บันทึกกิจกรรมทั้งหมด
  const saveActivities = async () => {
    if (!selectedChild) {
      setError('กรุณาเลือกเด็กก่อน');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const activities = [];
      
      // สร้างกิจกรรมจากพฤติกรรมดี
      goodBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.id];
        if (count > 0) {
          activities.push(api.utils.formatActivityData(
            selectedChild.id,
            behavior.id,
            API_CONFIG.ACTIVITY_TYPES.GOOD, // 'Good'
            count,
            `บันทึกจากแอป: ${behavior.name} ${count} ครั้ง`
          ));
        }
      });

      // สร้างกิจกรรมจากพฤติกรรมไม่ดี
      badBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.id];
        if (count > 0) {
          activities.push(api.utils.formatActivityData(
            selectedChild.id,
            behavior.id,
            API_CONFIG.ACTIVITY_TYPES.BAD, // 'Bad'
            count,
            `บันทึกจากแอป: ${behavior.name} ${count} ครั้ง`
          ));
        }
      });

      if (activities.length === 0) {
        setError('ไม่มีกิจกรรมที่จะบันทึก');
        return;
      }

      // บันทึกหลายกิจกรรมพร้อมกัน
      console.log('Recording activities:', activities);
      const results = await api.utils.recordMultipleActivities(activities);
      
      // ตรวจสอบผลลัพธ์
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        // ทั้งหมดสำเร็จ
        alert(`✅ บันทึกสำเร็จ ${successCount} กิจกรรม!`);
        
        // รีเซ็ตการนับและรีเฟรชข้อมูล
        setBehaviorCounts({});
        await refreshData();
        
      } else {
        // บางรายการล้มเหลว
        console.error('Some activities failed:', results.filter(r => !r.success));
        alert(`⚠️ บันทึกสำเร็จ ${successCount} กิจกรรม, ล้มเหลว ${failCount} กิจกรรม`);
      }

    } catch (err) {
      console.error('Error saving activities:', err);
      setError(`ไม่สามารถบันทึกได้: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  // แลกรางวัล
  const redeemReward = async (reward) => {
    if (!selectedChild) {
      setError('กรุณาเลือกเด็กก่อน');
      return;
    }

    const currentPoints = selectedChild.totalPoints || 0;
    
    if (currentPoints < reward.cost) {
      alert(`❌ คะแนนไม่พอ! ต้องการ ${reward.cost} คะแนน แต่มีอยู่ ${currentPoints} คะแนน`);
      return;
    }

    if (!confirm(`ต้องการแลกรางวัล "${reward.name}" ด้วย ${reward.cost} คะแนนหรือไม่?`)) {
      return;
    }

    try {
      const activityData = api.utils.formatActivityData(
        selectedChild.id,
        reward.id,
        API_CONFIG.ACTIVITY_TYPES.REWARD, // 'Reward'
        1,
        `แลกรางวัล: ${reward.name}`
      );

      const result = await api.activities.create(activityData);
      
      if (result.success) {
        alert(`🎁 แลกรางวัล "${reward.name}" สำเร็จ! ใช้คะแนน ${Math.abs(result.earned_points || reward.cost)} คะแนน`);
        
        // รีเฟรชข้อมูลเพื่ออัปเดตคะแนน
        await refreshData();
      }
      
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError(`ไม่สามารถแลกรางวัลได้: ${err.message || err}`);
    }
  };

  // คำนวณคะแนนที่จะได้รับ/เสีย
  const calculatePendingPoints = () => {
    let total = 0;
    
    goodBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.id] || 0;
      total += api.utils.calculateEarnedPoints(behavior.points, count);
    });
    
    badBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.id] || 0;
      total += api.utils.calculateEarnedPoints(behavior.points, count); // points ติดลบอยู่แล้ว
    });
    
    return total;
  };

  // นับจำนวนกิจกรรมทั้งหมด
  const getTotalActivitiesCount = () => {
    return Object.values(behaviorCounts).reduce((sum, count) => sum + count, 0);
  };

  const pendingPoints = calculatePendingPoints();
  const totalActivities = getTotalActivitiesCount();
  const currentPoints = selectedChild?.totalPoints || 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state (ไม่มีเด็ก)
  if (error && !selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // ไม่มีข้อมูลเด็ก
  if (!children.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
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
              {behavior.points > 0 ? '+' : ''}{behavior.points} คะแนน
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateBehaviorCount(behavior.id, -1)}
            disabled={count === 0}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="min-w-[3rem] text-center">
            <span className="text-lg font-bold text-gray-800">{count}</span>
            <div className="text-xs text-gray-500">ครั้ง</div>
          </div>
          
          <button
            onClick={() => updateBehaviorCount(behavior.id, 1)}
            className="p-2 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"
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
        canRedeem 
          ? 'bg-purple-50 border-purple-200 hover:shadow-lg cursor-pointer' 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg">🎁</div>
            <div>
              <div className="font-medium text-gray-800">{reward.name}</div>
              <div className="text-sm font-semibold text-purple-600">
                {reward.cost} คะแนน
              </div>
            </div>
          </div>
          
          <button
            onClick={() => canRedeem && redeemReward(reward)}
            disabled={!canRedeem}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canRedeem
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canRedeem ? 'แลก!' : 'คะแนนไม่พอ'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            🌈 MyKids Dashboard
          </h1>
          <p className="text-gray-600">บันทึกพฤติกรรมและดูคะแนน</p>
        </div>

        {/* Child Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            เลือกเด็ก
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {children.map((child) => (
              <ChildCard 
                key={child.id} 
                child={child} 
                isSelected={selectedChild?.id === child.id}
                onClick={setSelectedChild}
              />
            ))}
          </div>
        </div>

        {selectedChild && (
          <>
            {/* Selected Child Info */}
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl mb-2">{selectedChild.avatar}</div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedChild.name}</h2>
              <div className="text-purple-600 text-xl font-bold">
                {currentPoints} คะแนน
              </div>
              <div className="text-sm text-gray-500">
                รวมทั้งหมด ({(selectedChild.todayPoints || 0)} วันนี้)
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="text-green-600 font-bold">✅ งานดี</div>
                  <div className="text-sm text-gray-600">
                    กรณีเป็นไปตามกิจกรรมต่างๆ
                  </div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <div className="text-red-600 font-bold">❌ พฤติกรรมไม่ดี</div>
                  <div className="text-sm text-gray-600">
                    กิจกรรม ที่ ไม่ ควร ทำ  - ติดลบ
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-100 rounded-lg">
                  <div className="text-purple-600 font-bold">🎁 รางวัล</div>
                  <div className="text-sm text-gray-600">
                    ใช้คะแนนที่ได้ในการแลกมาใช้งาน
                  </div>
                </div>
              </div>

              {/* Good Behaviors */}
              {goodBehaviors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-3">
                    ✅ งานดี
                  </h3>
                  <div className="space-y-3">
                    {goodBehaviors.map((behavior) => (
                      <BehaviorItem 
                        key={behavior.id} 
                        behavior={behavior} 
                        count={behaviorCounts[behavior.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bad Behaviors */}
              {badBehaviors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">
                    ❌ พฤติกรรมไม่ดี
                  </h3>
                  <div className="space-y-3">
                    {badBehaviors.map((behavior) => (
                      <BehaviorItem 
                        key={behavior.id} 
                        behavior={behavior} 
                        count={behaviorCounts[behavior.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {rewards.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">
                    🎁 รางวัล
                  </h3>
                  <div className="space-y-3">
                    {rewards.map((reward) => (
                      <RewardItem key={reward.id} reward={reward} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {totalActivities > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    พร้อมบันทึก {totalActivities} กิจกรรม
                  </h3>
                  {pendingPoints !== 0 && (
                    <div className={`text-xl font-bold ${pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pendingPoints > 0 ? '+' : ''}{pendingPoints} คะแนน
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={saveActivities}
                    disabled={saving || totalActivities === 0}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                      saving || totalActivities === 0
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
                        💾 บันทึกข้อมูล ({totalActivities})
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={refreshData}
                    disabled={loading || saving}
                    className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    รีเฟรชข้อมูล
                  </button>
                </div>
              </div>
            )}

            {/* Today's Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                ความคืบหน้าวันนี้ - {selectedChild.name}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-gray-600 text-lg">
                    คะแนนปัจจุบัน: <span className="font-bold text-purple-600">{currentPoints}</span> คะแนน
                  </div>
                  {pendingPoints !== 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">รอบันทึก: </span>
                      <span className={`font-bold ${pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pendingPoints > 0 ? '+' : ''}{pendingPoints} คะแนน
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ChildDashboard;