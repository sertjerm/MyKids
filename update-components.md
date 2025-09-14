// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Users, Home, Settings, LogOut, User, Star, Gift, Calendar, BarChart3 } from 'lucide-react';
import mockData, { 
  mockFamilies, 
  getBehaviorsByFamily, 
  getRewardsByFamily, 
  getChildrenByFamily,
  calculateCurrentPoints,
  canPerformBehavior,
  canRedeemReward
} from './data/mockData';

// Import API service
import api from './services/api';

// Components
const Avatar = ({ src, alt, size = 'md', emoji }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden`}>
      {emoji ? (
        <span className="text-2xl">{emoji}</span>
      ) : src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
};

const BehaviorCard = ({ behavior, onSelect, selected, disabled = false, showPoints = true }) => {
  const isGood = behavior.Type === 'Good';
  
  return (
    <div 
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        disabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed'
          : selected 
            ? `${isGood ? 'behavior-card-good' : 'behavior-card-bad'} border-purple-400 shadow-xl ring-4 ring-purple-100` 
            : `${isGood ? 'behavior-card-good' : 'behavior-card-bad'} hover:shadow-lg`
      }`}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div 
            className="w-6 h-6 rounded-full shadow-md ring-2 ring-white"
            style={{ backgroundColor: behavior.Color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{behavior.Name}</h3>
          <p className="text-sm text-gray-600 font-medium mb-1">{behavior.Category}</p>
          {behavior.Description && (
            <p className="text-xs text-gray-500 leading-relaxed">{behavior.Description}</p>
          )}
        </div>
        {showPoints && (
          <div className="flex-shrink-0">
            <div className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md ${
              isGood 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
            }`}>
              {isGood ? '+' : ''}{behavior.Points}
            </div>
          </div>
        )}
      </div>
      {!behavior.IsRepeatable && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xs">📅</span>
          </div>
          <span className="text-xs text-blue-700 font-medium">
            ทำได้ {behavior.MaxPerDay || 1} ครั้ง/วัน
          </span>
        </div>
      )}
      {disabled && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-xs">✓</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            ทำครบแล้ว
          </span>
        </div>
      )}
    </div>
  );
};

const RewardCard = ({ reward, onSelect, disabled = false, childPoints = 0 }) => {
  const canAfford = childPoints >= reward.Cost;
  const actuallyDisabled = disabled || !canAfford;
  
  return (
    <div 
      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
        actuallyDisabled 
          ? 'border-gray-200 bg-gray-50/50 opacity-50 cursor-not-allowed'
          : 'reward-card cursor-pointer hover:shadow-lg transform hover:scale-105'
      }`}
      onClick={actuallyDisabled ? undefined : () => onSelect(reward)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shadow-md">
            <span className="text-2xl">{reward.ImagePath}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{reward.Name}</h3>
          <p className="text-sm text-gray-600 font-medium mb-1">{reward.Category}</p>
          {reward.Description && (
            <p className="text-xs text-gray-500 leading-relaxed">{reward.Description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className={`px-3 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1 ${
            canAfford 
              ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            <Star className="w-4 h-4" />
            {reward.Cost}
          </div>
        </div>
      </div>
      {!canAfford && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xs">💰</span>
            </div>
            <span className="text-xs text-red-700 font-medium">
              ต้องการอีก {reward.Cost - childPoints} แต้มเพื่อแลก
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const PointsBadge = ({ points }) => {
  const isPositive = points >= 0;
  
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
      isPositive 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      <Star className="w-4 h-4" />
      {points}
    </div>
  );
};

// Login Page
const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (family) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(family);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">MyKids Tracker</h1>
          <p className="text-gray-600">เลือกครอบครัวของคุณ</p>
        </div>
        
        <div className="space-y-4">
          {mockFamilies.map(family => (
            <button
              key={family.Id}
              onClick={() => handleLogin(family)}
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200 flex items-center gap-4 disabled:opacity-50"
            >
              <Avatar emoji={family.AvatarPath} size="md" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-800">{family.Name}</h3>
                <p className="text-sm text-gray-600">{family.Email}</p>
                <p className="text-xs text-gray-500">
                  {getChildrenByFamily(family.Id).length} คน
                </p>
              </div>
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Child Interface
const ChildInterface = ({ family, child, onBack }) => {
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);
  
  const today = new Date().toISOString().split('T')[0];
  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);
  
  useEffect(() => {
    // Calculate current points
    const points = calculateCurrentPoints(child.Id);
    setCurrentPoints(points);
    
    // Load today's activities
    const activities = mockData.mockDailyActivities.filter(activity => 
      activity.ChildId === child.Id && 
      activity.ActivityDate === today &&
      activity.Status === 'Approved'
    );
    setTodayActivities(activities);
  }, [child.Id, today]);

  const handleBehaviorSelect = async (behavior) => {
    try {
      // Check if behavior can be performed
      if (!canPerformBehavior(child.Id, behavior.Id, today)) {
        alert('พฤติกรรมนี้ทำครบแล้วสำหรับวันนี้');
        return;
      }

      // Add activity
      const activity = await api.addActivity({
        itemId: behavior.Id,
        childId: child.Id,
        activityDate: today,
        activityType: behavior.Type,
        note: `${behavior.Name} - เพิ่มโดยเด็ก`,
        status: 'Approved',
        approvedBy: family.Id
      });

      // Update points
      const newPoints = currentPoints + behavior.Points;
      setCurrentPoints(newPoints);
      setSelectedBehavior(behavior);
      
      // Add to today's activities
      setTodayActivities(prev => [activity, ...prev]);
      
      // Clear selection after animation
      setTimeout(() => {
        setSelectedBehavior(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to add behavior:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleRewardSelect = async (reward) => {
    try {
      if (!canRedeemReward(child.Id, reward.Id)) {
        alert('คะแนนไม่เพียงพอสำหรับรางวัลนี้');
        return;
      }

      // Add reward activity
      const activity = await api.addActivity({
        itemId: reward.Id,
        childId: child.Id,
        activityDate: today,
        activityType: 'Reward',
        note: `แลก ${reward.Name}`,
        status: 'Approved',
        approvedBy: family.Id
      });

      const newPoints = currentPoints - reward.Cost;
      setCurrentPoints(newPoints);
      setSelectedReward(reward);
      
      // Add to today's activities
      setTodayActivities(prev => [activity, ...prev]);
      
      setTimeout(() => {
        setSelectedReward(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <Avatar emoji={child.AvatarPath} size="xl" />
            <h2 className="text-xl font-bold text-gray-800 mt-2">{child.Name}</h2>
            <p className="text-gray-600">อายุ {child.Age} ปี</p>
          </div>
          <div className="w-8" />
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            <Star className="w-8 h-8 inline mr-2" />
            {currentPoints}
          </div>
          <p className="text-gray-600">คะแนนทั้งหมด</p>
        </div>
      </div>

      {/* Today's Activities Summary */}
      {todayActivities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            กิจกรรมวันนี้
          </h3>
          <div className="space-y-2">
            {todayActivities.slice(0, 3).map(activity => (
              <div key={activity.Id} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  activity.ActivityType === 'Good' ? 'bg-green-400' :
                  activity.ActivityType === 'Bad' ? 'bg-red-400' : 'bg-purple-400'
                }`} />
                <span className="flex-1">{activity.Note}</span>
                <span className={`font-semibold ${
                  activity.EarnedPoints > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.EarnedPoints > 0 ? '+' : ''}{activity.EarnedPoints}
                </span>
              </div>
            ))}
            {todayActivities.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                และอีก {todayActivities.length - 3} กิจกรรม
              </div>
            )}
          </div>
        </div>
      )}

      {/* Good Behaviors */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
          พฤติกรรมดี
        </h3>
        <div className="grid gap-3">
          {familyBehaviors.filter(b => b.Type === 'Good').map(behavior => (
            <BehaviorCard
              key={behavior.Id}
              behavior={behavior}
              onSelect={handleBehaviorSelect}
              selected={selectedBehavior?.Id === behavior.Id}
              disabled={!canPerformBehavior(child.Id, behavior.Id, today)}
            />
          ))}
        </div>
      </div>

      {/* Bad Behaviors */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✗</span>
          </div>
          พฤติกรรมไม่ดี
        </h3>
        <div className="grid gap-3">
          {familyBehaviors.filter(b => b.Type === 'Bad').map(behavior => (
            <BehaviorCard
              key={behavior.Id}
              behavior={behavior}
              onSelect={handleBehaviorSelect}
              selected={selectedBehavior?.Id === behavior.Id}
            />
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          รางวัล
        </h3>
        <div className="grid gap-3">
          {familyRewards.map(reward => (
            <RewardCard
              key={reward.Id}
              reward={reward}
              onSelect={handleRewardSelect}
              childPoints={currentPoints}
            />
          ))}
        </div>
      </div>

      {/* Success Messages */}
      {selectedBehavior && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg ${
          selectedBehavior.Type === 'Good' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {selectedBehavior.Type === 'Good' ? '🎉' : '😔'} {selectedBehavior.Name} {selectedBehavior.Points > 0 ? '+' : ''}{selectedBehavior.Points}
        </div>
      )}

      {selectedReward && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg bg-purple-500 text-white">
          🎁 ได้รับ {selectedReward.Name}!
        </div>
      )}
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ family, onLogout, onSelectChild }) => {
  const [activeTab, setActiveTab] = useState('children');
  const [familyData, setFamilyData] = useState({ children: [], totalPoints: 0 });

  useEffect(() => {
    loadFamilyData();
  }, [family.Id]);

  const loadFamilyData = () => {
    const children = getChildrenByFamily(family.Id).map(child => ({
      ...child,
      currentPoints: calculateCurrentPoints(child.Id)
    }));
    
    const totalPoints = children.reduce((sum, child) => sum + child.currentPoints, 0);
    
    setFamilyData({ children, totalPoints });
  };

  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);

  return (
    <div className="min-h-screen gradient-background">
      {/* Main Container with max-width */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar emoji={family.AvatarPath} size="lg" />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{family.Name}</h1>
                <p className="text-sm sm:text-base text-gray-600">{family.Email}</p>
                <p className="text-xs sm:text-sm text-gray-500">{family.Phone}</p>
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
          {activeTab === 'children' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">จัดการเด็ก</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {familyData.children.map(child => (
                  <div key={child.Id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar emoji={child.AvatarPath} size="md" />
                        <div className="text-center sm:text-left min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{child.Name}</h3>
                          <p className="text-sm text-gray-600">อายุ {child.Age} ปี • {child.Gender === 'M' ? 'ชาย' : 'หญิง'}</p>
                          <p className="text-xs text-gray-500 hidden sm:block">
                            เข้าร่วมเมื่อ {new Date(child.CreatedAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <PointsBadge points={child.currentPoints} />
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

          {activeTab === 'behaviors' && (
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

          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                รางวัล ({familyRewards.length} รายการ)
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {familyRewards.map(reward => (
                  <RewardCard key={reward.Id} reward={reward} onSelect={() => {}} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">รายงานสถิติ</h2>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {familyData.children.map(child => {
                  const childActivities = mockData.mockDailyActivities.filter(a => 
                    a.ChildId === child.Id && a.Status === 'Approved'
                  );
                  const goodCount = childActivities.filter(a => a.ActivityType === 'Good').length;
                  const badCount = childActivities.filter(a => a.ActivityType === 'Bad').length;
                  const rewardCount = childActivities.filter(a => a.ActivityType === 'Reward').length;
                  
                  return (
                    <div key={child.Id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar emoji={child.AvatarPath} size="md" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{child.Name}</h3>
                          <p className="text-sm text-gray-600">สถิติการทำกิจกรรม</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-green-600">{goodCount}</div>
                          <div className="text-xs sm:text-sm text-green-600">พฤติกรรมดี</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-red-600">{badCount}</div>
                          <div className="text-xs sm:text-sm text-red-600">พฤติกรรมไม่ดี</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-purple-600">{rewardCount}</div>
                          <div className="text-xs sm:text-sm text-purple-600">รางวัลที่แลก</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg sm:text-2xl font-bold text-blue-600">{child.currentPoints}</div>
                          <div className="text-xs sm:text-sm text-blue-600">คะแนนปัจจุบัน</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">ตั้งค่า</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">ข้อมูลครอบครัว</h3>
                  <p className="text-sm text-gray-600 mb-3">จัดการข้อมูลครอบครัวและสมาชิก</p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    แก้ไขข้อมูล
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">จัดการพฤติกรรมและรางวัล</h3>
                  <p className="text-sm text-gray-600 mb-3">เพิ่ม แก้ไข หรือลบพฤติกรรมและรางวัล</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                      เพิ่มพฤติกรรม
                    </button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm">
                      เพิ่มรางวัล
                    </button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">รีเซ็ตข้อมูลทดสอบ</h3>
                  <p className="text-sm text-gray-600 mb-3">ลบข้อมูลกิจกรรมทั้งหมดและรีเซ็ตคะแนน</p>
                  <button 
                    onClick={async () => {
                      if (confirm('คุณต้องการรีเซ็ตข้อมูลทดสอบทั้งหมดหรือไม่?')) {
                        try {
                          const result = await api.resetTestData();
                          alert(result.message);
                          loadFamilyData();
                        } catch (error) {
                          alert('เกิดข้อผิดพลาด: ' + error.message);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    รีเซ็ตข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentFamily, setCurrentFamily] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedChild, setSelectedChild] = useState(null);

  const handleLogin = (family) => {
    setCurrentFamily(family);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentFamily(null);
    setCurrentView('login');
    setSelectedChild(null);
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    setCurrentView('child');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin');
    setSelectedChild(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentView === 'admin' && currentFamily && (
        <AdminDashboard 
          family={currentFamily} 
          onLogout={handleLogout}
          onSelectChild={handleSelectChild}
        />
      )}
      
      {currentView === 'child' && currentFamily && selectedChild && (
        <ChildInterface 
          family={currentFamily}
          child={selectedChild}
          onBack={handleBackToAdmin}
        />
      )}
    </div>
  );
}

export default App;