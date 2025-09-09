import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Gift, Plus, Minus, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { childrenAPI, behaviorsAPI, rewardsAPI, activitiesAPI, apiUtils } from '../services/api';

const ChildDashboard = ({ childId: propChildId }) => {
  // State management
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayDate] = useState(new Date().toLocaleDateString('th-TH'));
  const [activeTab, setActiveTab] = useState('good');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Data from API
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  
  // Behavior counts (what user has selected)
  const [behaviorCounts, setBehaviorCounts] = useState({});
  
  // Selected child ID
  const [currentChildId, setCurrentChildId] = useState(propChildId || 'C001');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update current points when child changes
  useEffect(() => {
    if (selectedChild) {
      setCurrentPoints(selectedChild.TotalPoints || 0);
    }
  }, [selectedChild]);

  // Load data from API
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all required data in parallel
      const [childrenData, goodBehaviorsData, badBehaviorsData, rewardsData] = await Promise.all([
        childrenAPI.getAll(),
        behaviorsAPI.getGood(),
        behaviorsAPI.getBad(),
        rewardsAPI.getAll(),
      ]);

      setChildren(childrenData);
      setGoodBehaviors(goodBehaviorsData);
      setBadBehaviors(badBehaviorsData);
      setRewards(rewardsData);

      // Set selected child
      const child = childrenData.find(c => c.Id === currentChildId) || childrenData[0];
      if (child) {
        setSelectedChild(child);
        setCurrentChildId(child.Id);
      }

      console.log('Data loaded successfully:', {
        children: childrenData.length,
        goodBehaviors: goodBehaviorsData.length,
        badBehaviors: badBehaviorsData.length,
        rewards: rewardsData.length,
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await loadInitialData();
    setBehaviorCounts({}); // Reset counts
  };

  // Update behavior count
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

  // Save all recorded activities
  const saveActivities = async () => {
    if (!selectedChild) {
      setError('กรุณาเลือกเด็กก่อน');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare activities data
      const activities = [];
      
      // Add good behaviors
      goodBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.Id];
        if (count > 0) {
          activities.push(apiUtils.formatActivityData(
            selectedChild.Id,
            behavior.Id,
            'Good',
            count,
            `บันทึกจากแอป: ${behavior.Name} ${count} ครั้ง`
          ));
        }
      });

      // Add bad behaviors
      badBehaviors.forEach(behavior => {
        const count = behaviorCounts[behavior.Id];
        if (count > 0) {
          activities.push(apiUtils.formatActivityData(
            selectedChild.Id,
            behavior.Id,
            'Bad',
            count,
            `บันทึกจากแอป: ${behavior.Name} ${count} ครั้ง`
          ));
        }
      });

      if (activities.length === 0) {
        setError('ไม่มีกิจกรรมที่จะบันทึก');
        return;
      }

      // Record activities
      console.log('Recording activities:', activities);
      const results = await apiUtils.recordMultipleActivities(activities);
      
      // Check results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        // All successful
        alert(`✅ บันทึกสำเร็จ ${successCount} กิจกรรม`);
        
        // Reset counts and refresh data
        setBehaviorCounts({});
        await refreshData();
        
      } else {
        // Some failed
        console.error('Some activities failed:', results.filter(r => !r.success));
        alert(`⚠️ บันทึกสำเร็จ ${successCount} กิจกรรม, ล้มเหลว ${failCount} กิจกรรม`);
      }

    } catch (err) {
      console.error('Error saving activities:', err);
      setError(`ไม่สามารถบันทึกได้: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Redeem reward
  const redeemReward = async (reward) => {
    if (!selectedChild) {
      setError('กรุณาเลือกเด็กก่อน');
      return;
    }

    if (currentPoints < reward.Cost) {
      alert(`❌ คะแนนไม่พอ! ต้องการ ${reward.Cost} คะแนน แต่มีอยู่ ${currentPoints} คะแนน`);
      return;
    }

    if (!confirm(`ต้องการแลกรางวัล "${reward.Name}" ด้วย ${reward.Cost} คะแนนหรือไม่?`)) {
      return;
    }

    try {
      const activityData = apiUtils.formatActivityData(
        selectedChild.Id,
        reward.Id,
        'Reward',
        1,
        `แลกรางวัล: ${reward.Name}`
      );

      await activitiesAPI.record(activityData);
      alert(`🎁 แลกรางวัล "${reward.Name}" สำเร็จ!`);
      
      // Refresh data to update points
      await refreshData();
      
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError(`ไม่สามารถแลกรางวัลได้: ${err.message}`);
    }
  };

  // Calculate total points that will be earned/lost
  const calculatePendingPoints = () => {
    let total = 0;
    
    goodBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.Id] || 0;
      total += behavior.Points * count;
    });
    
    badBehaviors.forEach(behavior => {
      const count = behaviorCounts[behavior.Id] || 0;
      total += behavior.Points * count; // behavior.Points is negative for bad behaviors
    });
    
    return total;
  };

  // Get total activities count
  const getTotalActivitiesCount = () => {
    return Object.values(behaviorCounts).reduce((sum, count) => sum + count, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
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

  const pendingPoints = calculatePendingPoints();
  const totalActivities = getTotalActivitiesCount();

  // Behavior Item Component
  const BehaviorItem = ({ behavior, count }) => (
    <div 
      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-lg"
      style={{ backgroundColor: behavior.Color || (behavior.Points > 0 ? '#E8F5E8' : '#FFE4E1') }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {behavior.Points > 0 ? '😊' : '😔'}
        </div>
        <div>
          <div className="font-medium text-gray-800">{behavior.Name}</div>
          <div className={`text-sm font-semibold ${behavior.Points > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {behavior.Points > 0 ? '+' : ''}{behavior.Points} คะแนน
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateBehaviorCount(behavior.Id, -1)}
          disabled={count === 0}
          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold text-gray-800">
          {count}
        </span>
        
        <button
          onClick={() => updateBehaviorCount(behavior.Id, 1)}
          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Reward Item Component
  const RewardItem = ({ reward }) => (
    <div 
      className="p-4 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
      style={{ backgroundColor: reward.Color || '#F0F8FF' }}
      onClick={() => redeemReward(reward)}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎁</div>
          <div>
            <div className="font-medium text-gray-800">{reward.Name}</div>
            <div className="text-sm text-orange-600 font-semibold">
              💰 {reward.Cost} คะแนน
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">สถานะ</div>
          <div className={`text-lg font-bold ${currentPoints >= reward.Cost ? 'text-green-600' : 'text-red-500'}`}>
            {currentPoints >= reward.Cost ? '✅ แลกได้' : '❌ คะแนนไม่พอ'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Child Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <div 
              key={child.Id}
              onClick={() => {
                setSelectedChild(child);
                setCurrentChildId(child.Id);
                setBehaviorCounts({}); // Reset counts when switching child
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedChild?.Id === child.Id
                  ? 'bg-yellow-300 ring-4 ring-yellow-500 shadow-lg'
                  : 'bg-yellow-100 hover:bg-yellow-200'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">😊</div>
                <div className="font-bold text-gray-800">{child.Name}</div>
                <div className="text-sm text-gray-600">{child.Age || '-'} ขวบ 👶</div>
                <div className="text-sm text-gray-600">{child.TotalPoints || 0} คะแนน</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Child Info */}
        {selectedChild && (
          <div className="text-center bg-white p-6 rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {selectedChild.Name}
            </h1>
            <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
              {currentPoints} คะแนน
            </div>
            <div className="text-sm text-gray-600">
              รายงาน 07/10(ค)
            </div>
            
            {/* Pending Points Display */}
            {pendingPoints !== 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">คะแนนที่จะได้/เสีย:</div>
                <div className={`text-xl font-bold ${pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pendingPoints > 0 ? '+' : ''}{pendingPoints} คะแนน
                </div>
                <div className="text-xs text-gray-500">จาก {totalActivities} กิจกรรม</div>
              </div>
            )}
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab('good')}
            className={`btn-pastel flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'good' ? 'bg-green-500 text-white' : 'bg-white text-green-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">งานดี</span>
            <span className="sm:hidden">ดี</span>
          </button>
          
          <button
            onClick={() => setActiveTab('bad')}
            className={`btn-pastel flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'bad' ? 'bg-red-500 text-white' : 'bg-white text-red-600'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">พฤติกรรมไม่ดี</span>
            <span className="sm:hidden">ไม่ดี</span>
          </button>
          
          <button
            onClick={() => setActiveTab('rewards')}
            className={`btn-pastel flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'rewards' ? 'bg-purple-500 text-white' : 'bg-white text-purple-600'
            }`}
          >
            <Gift className="w-4 h-4" />
            รางวัล
          </button>
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          {activeTab === 'good' && (
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                😊 งานดี
              </h2>
              <p className="text-sm text-gray-600 mb-6">กดปุ่ม + เพื่อเพิ่มการทำงานดี แต่ละครั้ง</p>
              <div className="space-y-3">
                {goodBehaviors.map((behavior) => (
                  <BehaviorItem
                    key={behavior.Id}
                    behavior={behavior}
                    count={behaviorCounts[behavior.Id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bad' && (
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                😔 พฤติกรรมไม่ดี
              </h2>
              <p className="text-sm text-gray-600 mb-6">กด + เมื่อทำพฤติกรรมไม่ดี คะแนนจะลดลง</p>
              <div className="space-y-3">
                {badBehaviors.map((behavior) => (
                  <BehaviorItem
                    key={behavior.Id}
                    behavior={behavior}
                    count={behaviorCounts[behavior.Id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                🎁 รางวัล
              </h2>
              <p className="text-sm text-gray-600 mb-6">คลิกที่รางวัลเพื่อแลกด้วยคะแนนที่สะสมได้</p>
              <div className="grid gap-3">
                {rewards.map((reward) => (
                  <RewardItem key={reward.Id} reward={reward} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(activeTab === 'good' || activeTab === 'bad') && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={saveActivities}
              disabled={saving || totalActivities === 0}
              className="bg-orange-500 text-white px-6 lg:px-8 py-3 text-lg font-semibold rounded-xl flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
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
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-3 text-lg font-semibold rounded-xl flex items-center gap-2 justify-center hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรชข้อมูล
            </button>
          </div>
        )}

        {/* Today's Summary */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ความคืบหน้าวันนี้ - {selectedChild?.Name}
          </h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-center text-gray-600">
              คะแนนปัจจุบัน: {currentPoints} คะแนน
            </div>
            {pendingPoints !== 0 && (
              <div className="text-center mt-2">
                <span className="text-sm text-gray-500">รอบันทึก: </span>
                <span className={pendingPoints > 0 ? 'text-green-600' : 'text-red-600'}>
                  {pendingPoints > 0 ? '+' : ''}{pendingPoints} คะแนน
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;