// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Award, Clock, BarChart3, 
  ChevronRight, Star, CheckCircle, XCircle, 
  Gift, Calendar, Activity, Zap, Target,
  RefreshCw, AlertCircle, Loader2, Eye,
  Home, Settings, Plus, Minus, Repeat
} from 'lucide-react';

const MyKidsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [children, setChildren] = useState([]);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  // API Base URL
  const API_URL = 'https://sertjerm.com/my-kids-api/api.php';

  // โหลดข้อมูลจาก API จริง
  const loadAllData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      console.log('🔄 Loading all data from real API...');

      // ตรวจสอบ API health ก่อน
      const healthResponse = await fetch(`${API_URL}?health`);
      const healthData = await healthResponse.json();
      setApiStatus(healthData.db_status === 'connected' ? 'connected' : 'error');

      if (healthData.db_status !== 'connected') {
        throw new Error(`API Database not connected: ${healthData.db_error}`);
      }

      // โหลดข้อมูลพร้อมกัน
      const [
        childrenRes,
        goodBehaviorsRes,
        badBehaviorsRes, 
        rewardsRes,
        todaySummaryRes
      ] = await Promise.all([
        fetch(`${API_URL}?children`),
        fetch(`${API_URL}?good-behaviors`),
        fetch(`${API_URL}?bad-behaviors`),
        fetch(`${API_URL}?rewards`),
        fetch(`${API_URL}?dashboard`)
      ]);

      // แปลง response เป็น JSON
      const [
        childrenData,
        goodBehaviorsData,
        badBehaviorsData,
        rewardsData,
        dashboardData
      ] = await Promise.all([
        childrenRes.json(),
        goodBehaviorsRes.json(),
        badBehaviorsRes.json(),
        rewardsRes.json(),
        todaySummaryRes.json()
      ]);

      console.log('📊 Real API Data loaded:', {
        children: childrenData,
        goodBehaviors: goodBehaviorsData,
        badBehaviors: badBehaviorsData,
        rewards: rewardsData,
        dashboard: dashboardData
      });

      // ตั้งค่าข้อมูล
      setChildren(Array.isArray(childrenData) ? childrenData : []);
      setGoodBehaviors(Array.isArray(goodBehaviorsData) ? goodBehaviorsData : []);
      setBadBehaviors(Array.isArray(badBehaviorsData) ? badBehaviorsData : []);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setTodaySummary(dashboardData);

      console.log('✅ All data loaded successfully from API');

    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData(false);
  };

  useEffect(() => {
    loadAllData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // คำนวณสถิติจากข้อมูลจริง
  const calculateStats = () => {
    if (!children.length || !todaySummary?.children) return {
      todayPoints: 0,
      totalPoints: 0,
      weeklyProgress: 0,
      completedToday: 0,
      totalToday: goodBehaviors.length + badBehaviors.length,
      completionRate: 0
    };

    const child = children[0] || {}; // น้องพิฟา
    const childSummary = todaySummary.children.find(c => c.Id === child.Id) || {};
    
    const todayPoints = childSummary.TodayPoints || 0;
    const totalPoints = childSummary.TotalPoints || 0;

    return {
      todayPoints,
      totalPoints,
      weeklyProgress: Math.min(Math.round((todayPoints / 20) * 100), 100),
      completedToday: Math.floor(todayPoints / 3), 
      totalToday: goodBehaviors.length + badBehaviors.length,
      completionRate: Math.min(Math.round((todayPoints / 20) * 100), 100)
    };
  };

  const stats = calculateStats();
  const child = children[0] || { Id: 'C001', Name: 'น้องพิฟา', Age: 11, AvatarPath: null };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-purple-600 font-medium">กำลังโหลดข้อมูลจาก API...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadAllData()} 
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🌈</div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MyKids Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`hidden sm:flex items-center text-sm px-3 py-1 rounded-full ${
                apiStatus === 'connected' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected' 
                    ? 'bg-green-400 animate-pulse' 
                    : 'bg-red-400'
                }`}></span>
                {apiStatus === 'connected' ? 'API เชื่อมต่อแล้ว' : 'API ขัดข้อง'}
              </div>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-purple-200">
          <nav className="flex space-x-1" role="tablist">
            {[
              { id: 'overview', label: 'ภาพรวม', icon: BarChart3, count: children.length },
              { id: 'good-behaviors', label: 'พฤติกรรมดี', icon: CheckCircle, count: goodBehaviors.length },
              { id: 'bad-behaviors', label: 'พฤติกรรมไม่ดี', icon: XCircle, count: badBehaviors.length },
              { id: 'rewards', label: 'รางวัล', icon: Gift, count: rewards.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-[1.02]'
                      : 'text-purple-600 hover:bg-purple-100/50'
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Child Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{child.AvatarPath || '👧'}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{child.Name}</h2>
                    <p className="text-purple-600 font-medium mb-3">{child.Age} ปี</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                        <div className="text-2xl font-bold text-green-700">{stats.todayPoints}</div>
                        <div className="text-sm text-green-600 font-medium">คะแนนวันนี้</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                        <div className="text-2xl font-bold text-blue-700">{stats.totalPoints}</div>
                        <div className="text-sm text-blue-600 font-medium">คะแนนรวม</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                        <div className="text-2xl font-bold text-purple-700">{stats.completionRate}%</div>
                        <div className="text-sm text-purple-600 font-medium">ความสำเร็จ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium text-sm">พฤติกรรมดี</p>
                      <p className="text-2xl font-bold text-green-700">{goodBehaviors.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 font-medium text-sm">พฤติกรรมไม่ดี</p>
                      <p className="text-2xl font-bold text-red-700">{badBehaviors.length}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium text-sm">รางวัล</p>
                      <p className="text-2xl font-bold text-purple-700">{rewards.length}</p>
                    </div>
                    <Gift className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium text-sm">เด็กทั้งหมด</p>
                      <p className="text-2xl font-bold text-blue-700">{children.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  สรุปวันนี้ ({new Date().toLocaleDateString('th-TH')})
                </h3>
                
                {todaySummary?.children?.length > 0 ? (
                  <div className="space-y-3">
                    {todaySummary.children.map((child, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{child.AvatarPath || '👧'}</div>
                          <div>
                            <h4 className="font-bold text-gray-800">{child.Name}</h4>
                            <p className="text-sm text-gray-600">อายุ {child.Age} ปี</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            +{child.TodayPoints || 0}
                          </div>
                          <div className="text-sm text-gray-500">คะแนนวันนี้</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีกิจกรรมในวันนี้</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Good Behaviors Tab - List Format */}
          {activeTab === 'good-behaviors' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                พฤติกรรมดี ({goodBehaviors.length} รายการ)
              </h3>
              
              {goodBehaviors.length > 0 ? (
                <div className="space-y-2">
                  {goodBehaviors.map((behavior) => (
                    <div 
                      key={behavior.Id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-400 hover:shadow-md transition-all"
                    >
                      {/* Left Side - Icon & Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{behavior.Name}</h4>
                          <p className="text-sm text-gray-600">{behavior.Category || 'ทั่วไป'}</p>
                        </div>
                      </div>

                      {/* Right Side - Points & Status */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-green-600">+{behavior.Points}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {behavior.IsRepeatable ? (
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
                    </div>
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

          {/* Bad Behaviors Tab - List Format */}
          {activeTab === 'bad-behaviors' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                พฤติกรรมไม่ดี ({badBehaviors.length} รายการ)
              </h3>
              
              {badBehaviors.length > 0 ? (
                <div className="space-y-2">
                  {badBehaviors.map((behavior) => (
                    <div 
                      key={behavior.Id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-400 hover:shadow-md transition-all"
                    >
                      {/* Left Side - Icon & Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{behavior.Name}</h4>
                          <p className="text-sm text-gray-600">{behavior.Category || 'ทั่วไป'}</p>
                        </div>
                      </div>

                      {/* Right Side - Points & Status */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Minus className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-red-600">{behavior.Points}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {behavior.IsRepeatable ? (
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
                    </div>
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

          {/* Rewards Tab - List Format */}
          {activeTab === 'rewards' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-500" />
                รางวัล ({rewards.length} รายการ)
              </h3>
              
              {rewards.length > 0 ? (
                <div className="space-y-2">
                  {rewards.map((reward) => (
                    <div 
                      key={reward.Id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400 hover:shadow-md transition-all"
                    >
                      {/* Left Side - Icon & Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Gift className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{reward.Name}</h4>
                          <p className="text-sm text-gray-600">{reward.Category || 'ทั่วไป'}</p>
                        </div>
                      </div>

                      {/* Right Side - Cost */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Gift className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600">{reward.Cost}</span>
                          </div>
                          <span className="text-xs text-gray-500">คะแนน</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
      </div>
    </div>
  );
};

export default MyKidsDashboard;