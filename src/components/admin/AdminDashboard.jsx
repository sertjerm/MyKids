import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Gift, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Save, 
  X, 
  Edit,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { 
  useAdminDashboardData,
  useCreateChild,
  useCreateBehavior,
  useCreateReward,
  useApiStatus
 }  from "../../hooks/useApi";

const AdminDashboard = () => {
  // Data hooks
  const {
    dashboard,
    children,
    behaviors,
    rewards,
    activities,
    loading,
    error,
    refetchAll
  } = useAdminDashboardData();

  // Status hook
  const { status, statusData } = useApiStatus();

  // Mutation hooks
  const { createChild, loading: createChildLoading } = useCreateChild();
  const { createBehavior, loading: createBehaviorLoading } = useCreateBehavior();
  const { createReward, loading: createRewardLoading } = useCreateReward();

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [localError, setLocalError] = useState(null);

  // Modal handlers
  const openModal = (type) => {
    setShowModal(type);
    setFormData({});
    setLocalError(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setFormData({});
    setLocalError(null);
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit handlers
  const handleCreateChild = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.name || formData.name.trim().length < 2) {
      setLocalError('ชื่อเด็กต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }

    const result = await createChild({
      Name: formData.name.trim(),
      Age: formData.age ? parseInt(formData.age) : null,
      AvatarPath: formData.avatarPath || null
    });

    if (result.success) {
      alert('✅ เพิ่มเด็กสำเร็จ!');
      closeModal();
      refetchAll();
    } else {
      setLocalError(result.error);
    }
  };

  const handleCreateBehavior = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.name || formData.name.trim().length < 2) {
      setLocalError('ชื่อพฤติกรรมต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }

    if (!formData.points || !formData.type) {
      setLocalError('กรุณากรอกคะแนนและเลือกประเภท');
      return;
    }

    const result = await createBehavior({
      Name: formData.name.trim(),
      Points: parseInt(formData.points),
      Type: formData.type,
      Color: formData.color || (formData.type === 'Good' ? '#4ADE80' : '#EF4444'),
      Category: formData.category || null
    });

    if (result.success) {
      alert('✅ เพิ่มพฤติกรรมสำเร็จ!');
      closeModal();
      refetchAll();
    } else {
      setLocalError(result.error);
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.name || formData.name.trim().length < 2) {
      setLocalError('ชื่อรางวัลต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }

    if (!formData.cost || parseInt(formData.cost) <= 0) {
      setLocalError('ราคาแลกต้องมากกว่า 0');
      return;
    }

    const result = await createReward({
      Name: formData.name.trim(),
      Cost: parseInt(formData.cost),
      Color: formData.color || '#FFE4E1',
      Category: formData.category || null
    });

    if (result.success) {
      alert('✅ เพิ่มรางวัลสำเร็จ!');
      closeModal();
      refetchAll();
    } else {
      setLocalError(result.error);
    }
  };

  // Calculate statistics
  const stats = {
    totalChildren: children.length,
    totalBehaviors: behaviors.length,
    goodBehaviors: behaviors.filter(b => b.Type === 'Good').length,
    badBehaviors: behaviors.filter(b => b.Type === 'Bad').length,
    totalRewards: rewards.length,
    totalActivities: activities.length,
    totalPoints: children.reduce((sum, child) => sum + (child.TotalPoints || 0), 0)
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MyKids Admin</h1>
              <p className="text-sm text-gray-500">จัดการระบบติดตามพฤติกรรมเด็ก</p>
            </div>
            
            {/* API Status */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                status === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {status === 'connected' ? 'API Connected' : 'API Error'}
              </div>
              
              <button
                onClick={refetchAll}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                รีเฟรช
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เด็กทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalChildren}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">พฤติกรรม</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalBehaviors}</p>
                <p className="text-xs text-gray-500">ดี: {stats.goodBehaviors} | ไม่ดี: {stats.badBehaviors}</p>
              </div>
              <Activity className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รางวัล</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalRewards}</p>
              </div>
              <Gift className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กิจกรรมทั้งหมด</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalActivities}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'ภาพรวม', icon: TrendingUp },
                { id: 'children', name: 'เด็ก', icon: Users },
                { id: 'behaviors', name: 'พฤติกรรม', icon: Activity },
                { id: 'rewards', name: 'รางวัล', icon: Gift },
                { id: 'activities', name: 'กิจกรรม', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Children Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">เด็กในระบบ</h3>
              <div className="space-y-3">
                {children.slice(0, 5).map((child) => (
                  <div key={child.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{child.Name}</div>
                      <div className="text-sm text-gray-500">{child.Age} ขวบ</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{child.TotalPoints || 0}</div>
                      <div className="text-xs text-gray-500">คะแนน</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity, index) => (
                  <div key={activity.Id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {activity.ActivityType === 'Good' ? '😊' : 
                       activity.ActivityType === 'Bad' ? '😔' : '🎁'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.ItemName || 'กิจกรรม'}</div>
                      <div className="text-xs text-gray-500">
                        {activity.ActivityDate} - {activity.ChildId}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      activity.EarnedPoints > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.EarnedPoints > 0 ? '+' : ''}{activity.EarnedPoints}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">จัดการเด็ก</h2>
              <button
                onClick={() => openModal('child')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                เพิ่มเด็กใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div key={child.Id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="text-center">
                    <div className="text-4xl mb-3">😊</div>
                    <h3 className="text-lg font-semibold">{child.Name}</h3>
                    <p className="text-gray-600">{child.Age} ขวบ</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{child.TotalPoints || 0}</div>
                      <div className="text-sm text-gray-600">คะแนนรวม</div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="font-bold text-green-600">{child.GoodBehaviorCount || 0}</div>
                        <div className="text-gray-500">ดี</div>
                      </div>
                      <div>
                        <div className="font-bold text-red-600">{child.BadBehaviorCount || 0}</div>
                        <div className="text-gray-500">ไม่ดี</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-600">{child.RewardCount || 0}</div>
                        <div className="text-gray-500">รางวัล</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'behaviors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">จัดการพฤติกรรม</h2>
              <button
                onClick={() => openModal('behavior')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                เพิ่มพฤติกรรม
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Good Behaviors */}
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-4">พฤติกรรมดี</h3>
                <div className="space-y-3">
                  {behaviors.filter(b => b.Type === 'Good').map((behavior) => (
                    <div key={behavior.Id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{behavior.Name}</div>
                        <div className="text-sm text-gray-600">{behavior.Category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{behavior.Points}</div>
                        <div className="text-xs text-gray-500">คะแนน</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bad Behaviors */}
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4">พฤติกรรมไม่ดี</h3>
                <div className="space-y-3">
                  {behaviors.filter(b => b.Type === 'Bad').map((behavior) => (
                    <div key={behavior.Id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium">{behavior.Name}</div>
                        <div className="text-sm text-gray-600">{behavior.Category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{behavior.Points}</div>
                        <div className="text-xs text-gray-500">คะแนน</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">จัดการรางวัล</h2>
              <button
                onClick={() => openModal('reward')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                เพิ่มรางวัล
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward.Id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="text-lg font-semibold">{reward.Name}</h3>
                    <p className="text-gray-600">{reward.Category}</p>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{reward.Cost}</div>
                      <div className="text-sm text-gray-600">คะแนน</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">กิจกรรมล่าสุด</h2>
            
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เด็ก</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กิจกรรม</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.slice(0, 20).map((activity, index) => (
                      <tr key={activity.Id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.ActivityDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.ChildId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.ItemName || activity.ItemId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.ActivityType === 'Good' ? 'bg-green-100 text-green-800' :
                            activity.ActivityType === 'Bad' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {activity.ActivityType === 'Good' ? 'ดี' :
                             activity.ActivityType === 'Bad' ? 'ไม่ดี' : 'รางวัล'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={activity.EarnedPoints > 0 ? 'text-green-600' : 'text-red-600'}>
                            {activity.EarnedPoints > 0 ? '+' : ''}{activity.EarnedPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {showModal === 'child' && 'เพิ่มเด็กใหม่'}
                {showModal === 'behavior' && 'เพิ่มพฤติกรรม'}
                {showModal === 'reward' && 'เพิ่มรางวัล'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={
              showModal === 'child' ? handleCreateChild :
              showModal === 'behavior' ? handleCreateBehavior :
              handleCreateReward
            }>
              <div className="p-6 space-y-4">
                {localError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {localError}
                  </div>
                )}

                {/* Child Form */}
                {showModal === 'child' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเด็ก *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น น้องแอน"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">อายุ</label>
                      <input
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5"
                        min="1"
                        max="18"
                      />
                    </div>
                  </>
                )}

                {/* Behavior Form */}
                {showModal === 'behavior' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อพฤติกรรม *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น แปรงฟัน"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                      <select
                        value={formData.type || ''}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">เลือกประเภท</option>
                        <option value="Good">พฤติกรรมดี</option>
                        <option value="Bad">พฤติกรรมไม่ดี</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">คะแนน *</label>
                      <input
                        type="number"
                        value={formData.points || ''}
                        onChange={(e) => handleInputChange('points', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น สุขภาพ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                      <input
                        type="color"
                        value={formData.color || (formData.type === 'Good' ? '#4ADE80' : '#EF4444')}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Reward Form */}
                {showModal === 'reward' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อรางวัล *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น ไอศกรีม"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาแลก (คะแนน) *</label>
                      <input
                        type="number"
                        value={formData.cost || ''}
                        onChange={(e) => handleInputChange('cost', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น ขนม"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                      <input
                        type="color"
                        value={formData.color || '#FFE4E1'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createChildLoading || createBehaviorLoading || createRewardLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {(createChildLoading || createBehaviorLoading || createRewardLoading) && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;