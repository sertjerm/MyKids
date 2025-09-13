// src/pages/ChildDashboard.jsx - ปรับปรุงใช้ API ใหม่

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Star, CheckCircle, XCircle, Gift, Plus, Minus, Save, RefreshCw, 
  AlertCircle, Loader2, Users, Home
} from 'lucide-react';

// Import API ใหม่
import api, { API_CONFIG } from '../services/api.js';

const ChildDashboard = ({ childId: propChildId }) => {
  // Get childId from URL params หรือจาก props
  const { childId: urlChildId } = useParams();
  const childId = propChildId || urlChildId;

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
  const [activeTab, setActiveTab] = useState('good');
  
  // States สำหรับแสดงข้อมูล
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayDate] = useState(new Date().toLocaleDateString('th-TH'));

  // โหลดข้อมูลทั้งหมด
  const loadChildDashboardData = async () => {
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
        setCurrentPoints(targetChild.totalPoints || 0);
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
    loadChildDashboardData();
  }, [childId]);

  // อัปเดตคะแนนเมื่อเลือกเด็กใหม่
  useEffect(() => {
    if (selectedChild) {
      setCurrentPoints(selectedChild.totalPoints || 0);
      setBehaviorCounts({}); // รีเซ็ตการนับพฤติกรรม
    }
  }, [selectedChild]);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refetchAll = async () => {
    await loadChildDashboardData();
    setBehaviorCounts({}); // รีเซ็ตการนับ
  };

  // ฟังก์ชันสำหรับอัปเดตจำนวนพฤติกรรม
  const updateBehaviorCount = (behaviorId, change) => {
    setBehaviorCounts(prev => {
      const currentCount = prev[behaviorId] || 0;
      const newCount = Math.max(0, currentCount + change);
      return {
        ...prev,
        [behaviorId]: newCount
      };
    });
  };

  // บันทึกกิจกรรมใหม่ - ใช้ API ใหม่
  const createActivity = async (activityData) => {
    try {
      const result = await api.activities.create(activityData);
      console.log('Activity created:', result);
      return result;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับบันทึกกิจกรรมทั้งหมด
  const saveActivities = async () => {
    if (!selectedChild) {
      alert('กรุณาเลือกเด็กก่อน');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const activities = [];
      
      // สร้างรายการกิจกรรมจากพฤติกรรมดี
      goodBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.id];
        if (count > 0) {
          activities.push(api.utils.formatActivityData(
            selectedChild.id,
            behavior.id,
            API_CONFIG.ACTIVITY_TYPES.GOOD,
            count,
            `บันทึกจาก Child Dashboard: ${behavior.name} ${count} ครั้ง`
          ));
        }
      });

      // สร้างรายการกิจกรรมจากพฤติกรรมไม่ดี
      badBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.id];
        if (count > 0) {
          activities.push(api.utils.formatActivityData(
            selectedChild.id,
            behavior.id,
            API_CONFIG.ACTIVITY_TYPES.BAD,
            count,
            `บันทึกจาก Child Dashboard: ${behavior.name} ${count} ครั้ง`
          ));
        }
      });

      if (activities.length === 0) {
        alert('ไม่มีกิจกรรมที่จะบันทึก');
        return;
      }

      console.log('บันทึกกิจกรรม:', activities);

      // บันทึกหลายกิจกรรมพร้อมกัน
      const results = await api.utils.recordMultipleActivities(activities);
      
      // ตรวจสอบผลลัพธ์
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        alert(`✅ บันทึกสำเร็จ ${successCount} กิจกรรม!`);
        
        // รีเซ็ตการนับและรีเฟรชข้อมูล
        setBehaviorCounts({});
        await refetchAll();
        
      } else {
        console.error('Some activities failed:', results.filter(r => !r.success));
        alert(`⚠️ บันทึกสำเร็จ ${successCount} กิจกรรม, ล้มเหลว ${failCount} กิจกรรม`);
        
        // รีเฟรชข้อมูลแม้จะมีบางส่วนล้มเหลว
        await refetchAll();
      }

    } catch (error) {
      console.error('บันทึกกิจกรรมล้มเหลว:', error);
      setError('บันทึกล้มเหลว: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // แลกรางวัล - ใช้ API ใหม่
  const redeemReward = async (reward) => {
    if (!selectedChild) {
      alert('กรุณาเลือกเด็กก่อน');
      return;
    }

    const currentTotalPoints = selectedChild.totalPoints || 0;
    
    if (currentTotalPoints < reward.cost) {
      alert(`❌ คะแนนไม่พอ! ต้องการ ${reward.cost} คะแนน แต่มีอยู่ ${currentTotalPoints} คะแนน`);
      return;
    }

    if (!confirm(`ต้องการแลกรางวัล "${reward.name}" ด้วย ${reward.cost} คะแนนหรือไม่?`)) {
      return;
    }

    try {
      const activityData = api.utils.formatActivityData(
        selectedChild.id,
        reward.id,
        API_CONFIG.ACTIVITY_TYPES.REWARD,
        1,
        `แลกรางวัล: ${reward.name}`
      );

      const result = await api.activities.create(activityData);
      
      if (result.success) {
        alert(`🎁 แลกรางวัล "${reward.name}" สำเร็จ!`);
        
        // รีเฟรชข้อมูลเพื่ออัปเดตคะแนน
        await refetchAll();
      }
      
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert(`ไม่สามารถแลกรางวัลได้: ${error.message}`);
    }
  };

  // คำนวณคะแนนที่จะได้/เสีย
  const calculatePendingPoints = () => {
    let total = 0;
    
    goodBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.id] || 0;
      total += api.utils.calculateEarnedPoints(behavior.points, count);
    });
    
    badBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.id] || 0;
      total += api.utils.calculateEarnedPoints(behavior.points, count);
    });
    
    return total;
  };

  // นับจำนวนกิจกรรมทั้งหมด
  const getTotalActivitiesCount = () => {
    return Object.values(behaviorCounts).reduce((sum, count) => sum + count, 0);
  };

  const pendingPoints = calculatePendingPoints();
  const totalActivities = getTotalActivitiesCount();

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
  if (error && !children.length) {
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
    const canRedeem = (selectedChild?.totalPoints || 0) >= reward.cost;
    
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
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            🌈 MyKids - หน้าเด็ก
          </h1>
          <p className="text-gray-600">บันทึกพฤติกรรมและดูคะแนนของคุณ</p>
          <div className="text-sm text-gray-500 mt-1">
            📅 วันนี้: {todayDate}
          </div>
        </div>

        {/* Child Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
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
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedChild.name}</h2>
              <div className="text-purple-600 text-xl font-bold mb-1">
                {currentPoints} คะแนน
              </div>
              <div className="text-sm text-gray-500">
                รวมทั้งหมด (วันนี้: {selectedChild.todayPoints || 0} คะแนน)
              </div>
              {pendingPoints !== 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">คะแนนรอบันทึก:</div>
                  <div className={`text-lg font-bold ${pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pendingPoints > 0 ? '+' : ''}{pendingPoints} คะแนน
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('good')}
                  className={`flex-1 py-4 px-6 font-medium transition-colors ${
                    activeTab === 'good'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>งานดี</span>
                    {goodBehaviors.length > 0 && (
                      <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                        {goodBehaviors.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('bad')}
                  className={`flex-1 py-4 px-6 font-medium transition-colors ${
                    activeTab === 'bad'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <span>พฤติกรรมไม่ดี</span>
                    {badBehaviors.length > 0 && (
                      <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                        {badBehaviors.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex-1 py-4 px-6 font-medium transition-colors ${
                    activeTab === 'rewards'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    <span>รางวัล</span>
                    {rewards.length > 0 && (
                      <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                        {rewards.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'good' && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-4">
                      ✅ งานดีที่ทำได้
                    </h3>
                    {goodBehaviors.length > 0 ? (
                      <div className="space-y-3">
                        {goodBehaviors.map((behavior) => (
                          <BehaviorItem 
                            key={behavior.id} 
                            behavior={behavior} 
                            count={behaviorCounts[behavior.id] || 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">ยังไม่มีงานดีในระบบ</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bad' && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-4">
                      ❌ พฤติกรรมที่ไม่ควรทำ
                    </h3>
                    {badBehaviors.length > 0 ? (
                      <div className="space-y-3">
                        {badBehaviors.map((behavior) => (
                          <BehaviorItem 
                            key={behavior.id} 
                            behavior={behavior} 
                            count={behaviorCounts[behavior.id] || 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">ยังไม่มีพฤติกรรมไม่ดีในระบบ</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700 mb-4">
                      🎁 รางวัลที่แลกได้
                    </h3>
                    {rewards.length > 0 ? (
                      <div className="space-y-3">
                        {rewards.map((reward) => (
                          <RewardItem key={reward.id} reward={reward} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">ยังไม่มีรางวัลในระบบ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {totalActivities > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🎯 พร้อมบันทึก {totalActivities} กิจกรรม
                  </h3>
                  {pendingPoints !== 0 && (
                    <div className={`text-xl font-bold ${pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pendingPoints > 0 ? '🎉 +' : '😔 '}{pendingPoints} คะแนน
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={saveActivities}
                    disabled={saving || totalActivities === 0}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 justify-center ${
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
                        💾 บันทึกใหม่ ({totalActivities})
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={refetchAll}
                    disabled={loading || saving}
                    className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    รีเฟรชข้อมูล
                  </button>
                </div>
              </div>
            )}

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