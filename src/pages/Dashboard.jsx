// src/pages/Dashboard.jsx - Admin Dashboard หน้าหลัก ปรับปรุงใช้ API ใหม่

import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Gift, Plus, Edit, Trash2, 
  Settings, Home, AlertCircle, Loader2, RefreshCw, 
  TrendingUp, Calendar, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import API ใหม่
import api, { API_CONFIG } from '../services/api.js';

const Dashboard = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [children, setChildren] = useState([]);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // โหลดข้อมูลทั้งหมด
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading main dashboard data...');

      // ตรวจสอบสถานะ API ก่อน
      const status = await api.utils.checkStatus();
      setApiStatus(status.status);

      if (status.status !== 'connected') {
        throw new Error(`API ไม่สามารถเชื่อมต่อได้: ${status.data.error}`);
      }

      // โหลดข้อมูลพร้อมกัน
      const [
        dashboardResponse,
        childrenResponse,
        goodBehaviorsResponse,
        badBehaviorsResponse,
        rewardsResponse,
        activitiesResponse
      ] = await Promise.all([
        api.dashboard.getSummary(),
        api.children.getAll(),
        api.behaviors.getGood(),
        api.behaviors.getBad(),
        api.rewards.getAll(),
        api.activities.getAll()
      ]);

      console.log('📊 Main dashboard API responses:', {
        dashboard: dashboardResponse,
        children: childrenResponse,
        goodBehaviors: goodBehaviorsResponse,
        badBehaviors: badBehaviorsResponse,
        rewards: rewardsResponse,
        activities: activitiesResponse
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

      const transformedActivities = Array.isArray(activitiesResponse)
        ? activitiesResponse.map(api.utils.transformActivity)
        : [];

      // ตั้งค่าข้อมูล
      setDashboardData(dashboardResponse);
      setChildren(transformedChildren);
      setGoodBehaviors(transformedGoodBehaviors);
      setBadBehaviors(transformedBadBehaviors);
      setRewards(transformedRewards);
      setActivities(transformedActivities);

      console.log('✅ Main dashboard data loaded successfully');

    } catch (err) {
      console.error('❌ Error loading main dashboard data:', err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message || err}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshData = async () => {
    await loadDashboardData();
  };

  // คำนวณสถิติ
  const calculateStats = () => {
    const totalActivitiesToday = activities.filter(
      activity => activity.activityDate === new Date().toISOString().split('T')[0]
    ).length;

    const totalPointsToday = children.reduce((sum, child) => sum + (child.todayPoints || 0), 0);
    const totalPointsAll = children.reduce((sum, child) => sum + (child.totalPoints || 0), 0);

    return {
      totalChildren: children.length,
      totalGoodBehaviors: goodBehaviors.length,
      totalBadBehaviors: badBehaviors.length,
      totalRewards: rewards.length,
      totalActivitiesToday,
      totalPointsToday,
      totalPointsAll,
      apiConnected: apiStatus === 'connected'
    };
  };

  const stats = calculateStats();

  // Component สำหรับการ์ดสถิติ
  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className={`${color} rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-white border-opacity-20`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="font-semibold text-gray-700">{title}</h3>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {trend && (
          <div className="text-green-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );

  // Component สำหรับปุ่ม Tab
  const TabButton = ({ id, label, icon, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
      } border border-blue-200`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  // Component สำหรับแสดงเด็ก
  const ChildOverviewCard = ({ child }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">{child.avatar}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
          <p className="text-gray-600">{child.age} ขวบ</p>
        </div>
        <Link
          to={`/child/${child.id}`}
          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          เข้าใช้งาน
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-600">{child.todayPoints || 0}</div>
          <div className="text-gray-600">คะแนนวันนี้</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="font-semibold text-purple-600">{child.totalPoints || 0}</div>
          <div className="text-gray-600">คะแนนรวม</div>
        </div>
      </div>
    </div>
  );

  // Component สำหรับแสดงกิจกรรมล่าสุด
  const RecentActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'Good': return '😊';
        case 'Bad': return '😔';
        case 'Reward': return '🎁';
        default: return '📝';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'Good': return 'text-green-600 bg-green-50';
        case 'Bad': return 'text-red-600 bg-red-50';
        case 'Reward': return 'text-purple-600 bg-purple-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
        <div className="text-lg">{getActivityIcon(activity.activityType)}</div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{activity.childName}</div>
          <div className="text-sm text-gray-600">{activity.itemName}</div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getActivityColor(activity.activityType)}`}>
          {activity.count}x
        </div>
        <div className="text-xs text-gray-500">
          {new Date(activity.createdAt).toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-700">กำลังโหลดข้อมูลแดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-4 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            🔧 ระบบจัดการ Admin
          </h1>
          <p className="text-gray-600">แดशบอร์ดหลักสำหรับผู้ดูแลระบบ</p>
          
          {/* API Status Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              API: {apiStatus === 'connected' ? 'เชื่อมต่อแล้ว' : 
                   apiStatus === 'error' ? 'เกิดข้อผิดพลาด' : 'กำลังตรวจสอบ'}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            icon={<Users className="w-8 h-8 text-blue-500" />}
            title="เด็กทั้งหมด"
            value={stats.totalChildren}
            subtitle="คนในระบบ"
            color="bg-gradient-to-br from-blue-100 to-blue-50"
          />
          <StatCard
            icon={<Activity className="w-8 h-8 text-green-500" />}
            title="กิจกรรมวันนี้"
            value={stats.totalActivitiesToday}
            subtitle="รายการ"
            color="bg-gradient-to-br from-green-100 to-green-50"
            trend={stats.totalActivitiesToday > 0}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-purple-500" />}
            title="คะแนนวันนี้"
            value={stats.totalPointsToday}
            subtitle="คะแนนที่ได้รับ"
            color="bg-gradient-to-br from-purple-100 to-purple-50"
          />
          <StatCard
            icon={<Gift className="w-8 h-8 text-orange-500" />}
            title="คะแนนรวม"
            value={stats.totalPointsAll}
            subtitle="คะแนนทั้งหมด"
            color="bg-gradient-to-br from-orange-100 to-orange-50"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">งานดี</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalGoodBehaviors}</div>
            <div className="text-sm text-gray-600">รายการ</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">พฤติกรรมไม่ดี</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalBadBehaviors}</div>
            <div className="text-sm text-gray-600">รายการ</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">รางวัล</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalRewards}</div>
            <div className="text-sm text-gray-600">รายการ</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">สถานะระบบ</span>
            </div>
            <div className={`text-2xl font-bold ${apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus === 'connected' ? 'ปกติ' : 'ขัดข้อง'}
            </div>
            <div className="text-sm text-gray-600">API Status</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          <TabButton
            id="overview"
            label="ภาพรวม"
            icon={<Home className="w-4 h-4" />}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="children"
            label="เด็กทั้งหมด"
            icon={<Users className="w-4 h-4" />}
            isActive={activeTab === 'children'}
            onClick={setActiveTab}
            count={stats.totalChildren}
          />
          <TabButton
            id="activities"
            label="กิจกรรมล่าสุด"
            icon={<Activity className="w-4 h-4" />}
            isActive={activeTab === 'activities'}
            onClick={setActiveTab}
            count={stats.totalActivitiesToday}
          />
          <TabButton
            id="settings"
            label="ตั้งค่า"
            icon={<Settings className="w-4 h-4" />}
            isActive={activeTab === 'settings'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 ภาพรวมระบบ</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Children Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">เด็กในระบบ</h3>
                  {children.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {children.map((child) => (
                        <ChildOverviewCard key={child.id} child={child} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">ยังไม่มีข้อมูลเด็กในระบบ</p>
                    </div>
                  )}
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">กิจกรรมล่าสุด</h3>
                  {activities.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activities.slice(0, 10).map((activity, index) => (
                        <RecentActivityItem key={activity.id || index} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">ยังไม่มีกิจกรรมในระบบ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Children Tab */}
          {activeTab === 'children' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">👨‍👩‍👧‍👦 จัดการข้อมูลเด็ก</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  เพิ่มเด็กใหม่
                </button>
              </div>

              {children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {children.map((child) => (
                    <ChildOverviewCard key={child.id} child={child} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">ยังไม่มีข้อมูลเด็กในระบบ</p>
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 กิจกรรมล่าสุด</h2>

              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <RecentActivityItem key={activity.id || index} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">ยังไม่มีกิจกรรมในระบบ</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ ตั้งค่าระบบ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">การเชื่อมต่อ API</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        apiStatus === 'connected' ? 'bg-green-500' : 
                        apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="font-medium">
                        สถานะ: {apiStatus === 'connected' ? 'เชื่อมต่อแล้ว' : 
                               apiStatus === 'error' ? 'เกิดข้อผิดพลาด' : 'กำลังตรวจสอบ'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      API URL: {API_CONFIG.BASE_URL}
                    </p>
                    <button 
                      onClick={refreshData}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      ตรวจสอบการเชื่อมต่อ
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">ข้อมูลระบบ</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>เวอร์ชั่น:</span>
                      <span className="font-medium">v3.2.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className={`font-medium ${dashboardData?.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                        {dashboardData?.database || 'unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>อัปเดตล่าสุด:</span>
                      <span className="font-medium">
                        {new Date().toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🌈 MyKids Admin Dashboard v3.2.0 - สร้างด้วย ❤️ เพื่อเด็กๆ</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;