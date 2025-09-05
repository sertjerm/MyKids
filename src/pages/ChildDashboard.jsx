import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Gift, Plus, Minus, Save } from 'lucide-react';

const ChildDashboard = ({ childId }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayDate] = useState(new Date().toLocaleDateString('th-TH'));
  const [activeTab, setActiveTab] = useState('good');
  
  const [goodBehaviors] = useState([
    { id: 'bhv_001', name: 'แปรฟัน', points: 3, color: '#4ADE80' },
    { id: 'bhv_002', name: 'เก็บของเล่น', points: 2, color: '#60A5FA' },
    { id: 'bhv_003', name: 'อ่านหนังสือ', points: 5, color: '#A78BFA' },
    { id: 'bhv_004', name: 'ช่วยงาน', points: 4, color: '#FBBF24' },
    { id: 'bhv_005', name: 'หาดหวาน', points: 8, color: '#FB7185' },
    { id: 'bhv_006', name: 'ดื่มน้ำ', points: 3, color: '#34D399' },
    { id: 'bhv_007', name: 'ช่วยพี่/น้อง', points: 6, color: '#F472B6' }
  ]);

  const [badBehaviors] = useState([
    { id: 'bhv_bad_001', name: 'ขุดคาย', points: -3, color: '#EF4444' },
    { id: 'bhv_bad_002', name: 'โกหก', points: -5, color: '#DC2626' },
    { id: 'bhv_bad_003', name: 'ขี้เล่น', points: -2, color: '#F87171' },
    { id: 'bhv_bad_004', name: 'เล่นมือถือนาน', points: -4, color: '#FCA5A5' },
    { id: 'bhv_bad_005', name: 'หิวร้าวเพื่อน', points: -8, color: '#B91C1C' },
    { id: 'bhv_bad_006', name: 'ไม่ใส่ขรุ่ย', points: -6, color: '#DC2626' }
  ]);

  const [rewards] = useState([
    { id: 'rwd_001', name: 'ไอศกรีม', cost: 10, color: '#FFE4E1' },
    { id: 'rwd_002', name: 'ดู YouTube 30 นาที', cost: 15, color: '#E6E6FA' },
    { id: 'rwd_003', name: 'ซื้อสติ๊กเกอร์', cost: 20, color: '#F0F8FF' },
    { id: 'rwd_004', name: 'สะตึงร้า', cost: 25, color: '#FFF8DC' },
    { id: 'rwd_005', name: 'พ่อแบบปูพื่น', cost: 50, color: '#FFEFD5' },
    { id: 'rwd_006', name: 'ไปเที่ยวบ้านพื่อเป็', cost: 80, color: '#F5FFFA' },
    { id: 'rwd_007', name: 'ลุง 100 บาท', cost: 100, color: '#FFF5EE' },
    { id: 'rwd_008', name: 'เอิ่นบ้านใพ', cost: 60, color: '#F0FFFF' },
    { id: 'rwd_009', name: 'ไปพานิจ', cost: 120, color: '#F5F5DC' },
    { id: 'rwd_010', name: 'บัดปีมิส', cost: 150, color: '#FFB6C1' }
  ]);

  const [behaviorCounts, setBehaviorCounts] = useState({});

  useEffect(() => {
    if (!selectedChild) {
      setSelectedChild({
        id: 'child_001',
        name: 'น้องพีฟ่า',
        age: 11,
        avatar: '👧'
      });
    }
  }, [selectedChild]);

  const updateBehaviorCount = (behaviorId, change) => {
    setBehaviorCounts(prev => {
      const newCount = Math.max(0, (prev[behaviorId] || 0) + change);
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

  const BehaviorItem = ({ behavior, count = 0 }) => (
    <div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-lg gap-4"
      style={{ backgroundColor: behavior.color + '20', borderColor: behavior.color }}
    >
      <div className="flex items-center gap-3">
        <div className="text-lg">
          {behavior.points > 0 ? '😊' : '😔'}
        </div>
        <div>
          <div className="font-medium text-gray-800">{behavior.name}</div>
          <div className={`text-sm font-semibold ${behavior.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {behavior.points > 0 ? '+' : ''}{behavior.points} คะแนน
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateBehaviorCount(behavior.id, -1)}
          disabled={count === 0}
          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold text-gray-800">
          {count}
        </span>
        
        <button
          onClick={() => updateBehaviorCount(behavior.id, 1)}
          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const RewardItem = ({ reward }) => (
    <div 
      className="p-4 rounded-xl transition-all duration-300 hover:shadow-lg"
      style={{ backgroundColor: reward.color }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎁</div>
          <div>
            <div className="font-medium text-gray-800">{reward.name}</div>
            <div className="text-sm text-orange-600 font-semibold">
              💰 {reward.cost} คะแนน
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">เหลือ</div>
          <div className="text-lg font-bold text-gray-800">
            {currentPoints - reward.cost >= 0 ? currentPoints - reward.cost : '-'}
          </div>
        </div>
      </div>
    </div>
  );

  if (!selectedChild) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">🌈</div>
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Child Header */}
      <div className="card-pastel text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <div className="text-6xl">{selectedChild.avatar}</div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-primary-700">
              {selectedChild.name}
            </h1>
            <p className="text-primary-600">{selectedChild.age} ขวบ</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-6 lg:w-8 h-6 lg:h-8 text-yellow-500 animate-bounce-slow" />
          <span className="text-3xl lg:text-4xl font-bold text-purple-600">
            {currentPoints} คะแนน
          </span>
          <Star className="w-6 lg:w-8 h-6 lg:h-8 text-yellow-500 animate-bounce-slow" />
        </div>
        
        <p className="text-gray-600 text-sm lg:text-base">วันที่วันนี้: {todayDate}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveTab('good')}
          className={`btn-pastel flex items-center gap-2 ${
            activeTab === 'good' ? 'bg-green-500 text-white' : 'bg-white text-green-600'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden sm:inline">งานดี</span>
          <span className="sm:hidden">ดี</span>
        </button>
        
        <button
          onClick={() => setActiveTab('bad')}
          className={`btn-pastel flex items-center gap-2 ${
            activeTab === 'bad' ? 'bg-red-500 text-white' : 'bg-white text-red-600'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span className="hidden sm:inline">พฤติกรรมไม่ดี</span>
          <span className="sm:hidden">ไม่ดี</span>
        </button>
        
        <button
          onClick={() => setActiveTab('rewards')}
          className={`btn-pastel flex items-center gap-2 ${
            activeTab === 'rewards' ? 'bg-purple-500 text-white' : 'bg-white text-purple-600'
          }`}
        >
          <Gift className="w-4 h-4" />
          รางวัล
        </button>
      </div>

      {/* Content */}
      <div className="card-pastel">
        {activeTab === 'good' && (
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              😊 งานดี
            </h2>
            <p className="text-sm text-gray-600 mb-6">กดปุ่ม + เพื่อเพิ่มการทำงานดี แต่ละครั้ง</p>
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

        {activeTab === 'bad' && (
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              😔 พฤติกรรมไม่ดี
            </h2>
            <p className="text-sm text-gray-600 mb-6">กด + เมื่อทำพฤติกรรมไม่ดี คะแนนจะลดลง</p>
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

        {activeTab === 'rewards' && (
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              🎁 รางวัล
            </h2>
            <p className="text-sm text-gray-600 mb-6">ใช้คะแนนที่สะสมได้แลกรางวัลที่ต้องการ</p>
            <div className="grid gap-3">
              {rewards.map((reward) => (
                <RewardItem key={reward.id} reward={reward} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="btn-pastel bg-primary-500 text-white px-6 lg:px-8 py-3 text-lg font-semibold flex items-center gap-2 mx-auto">
          <Save className="w-5 h-5" />
          💾 บันทึกข้อมูล
        </button>
      </div>

      {/* Today's Summary */}
      <div className="card-pastel">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ความคืบหน้าวันนี้ - {selectedChild.name}</h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-600 text-center">0% เสร็จสิ้น</p>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
