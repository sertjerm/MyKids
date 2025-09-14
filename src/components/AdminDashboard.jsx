import React, { useState, useEffect } from "react";
import { Users, Star, Gift, BarChart3, Settings, LogOut } from "lucide-react";
import Avatar from "./Avatar";
import BehaviorCard from "./BehaviorCard";
import RewardCard from "./RewardCard";
import PointsBadge from "./PointsBadge";
import mockData, {
  getChildrenByFamily,
  getBehaviorsByFamily,
  getRewardsByFamily,
  calculateCurrentPoints,
} from "../data/mockData";
import api from "../services/api";

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


export default AdminDashboard;
