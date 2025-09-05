import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Gift, Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalChildren: 2,
    goodBehaviors: 7,
    badBehaviors: 6,
    totalRewards: 10
  });
  
  const [children, setChildren] = useState([
    { id: 'child_001', name: 'น้องพีฟ่า', age: 11, avatarPath: '👧' },
    { id: 'child_002', name: 'น้องพีฟอง', age: 10, avatarPath: '👦' }
  ]);
  
  const [activeTab, setActiveTab] = useState('children');

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`card-pastel ${color} transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`btn-pastel flex items-center gap-2 ${
        isActive ? 'bg-primary-500 text-white' : 'bg-white text-primary-600'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-700 mb-2">
          🔧 ระบบจัดการ Admin
        </h1>
        <p className="text-gray-600">จัดการข้อมูลเด็ก พฤติกรรม และรางวัล</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Users className="w-8 lg:w-12 h-8 lg:h-12 text-blue-500" />}
          title="ลูกทั้งหมด"
          value={stats.totalChildren}
          color="bg-pastel-blue"
        />
        <StatCard
          icon={<CheckCircle className="w-8 lg:w-12 h-8 lg:h-12 text-green-500" />}
          title="งานดี"
          value={stats.goodBehaviors}
          color="bg-pastel-green"
        />
        <StatCard
          icon={<XCircle className="w-8 lg:w-12 h-8 lg:h-12 text-red-500" />}
          title="พฤติกรรมไม่ดี"
          value={stats.badBehaviors}
          color="bg-pastel-red"
        />
        <StatCard
          icon={<Gift className="w-8 lg:w-12 h-8 lg:h-12 text-purple-500" />}
          title="รางวัล"
          value={stats.totalRewards}
          color="bg-pastel-purple"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        <TabButton
          id="children"
          label="จัดการลูก"
          icon={<Users className="w-4 h-4" />}
          isActive={activeTab === 'children'}
          onClick={setActiveTab}
        />
        <TabButton
          id="behaviors"
          label="งานดี"
          icon={<CheckCircle className="w-4 h-4" />}
          isActive={activeTab === 'behaviors'}
          onClick={setActiveTab}
        />
        <TabButton
          id="bad-behaviors"
          label="พฤติกรรมไม่ดี"
          icon={<XCircle className="w-4 h-4" />}
          isActive={activeTab === 'bad-behaviors'}
          onClick={setActiveTab}
        />
        <TabButton
          id="rewards"
          label="รางวัล"
          icon={<Gift className="w-4 h-4" />}
          isActive={activeTab === 'rewards'}
          onClick={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="card-pastel">
        {activeTab === 'children' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                👥 จัดการข้อมูลลูก
              </h2>
              <button className="btn-pastel bg-primary-500 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มลูกใหม่
              </button>
            </div>
            
            <div className="space-y-4">
              {children.map((child) => (
                <div key={child.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{child.avatarPath}</div>
                    <div>
                      <div className="font-semibold text-lg text-gray-800">{child.name}</div>
                      <div className="text-sm text-gray-600">{child.age} ขวบ</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-pastel bg-blue-500 text-white flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button className="btn-pastel bg-red-500 text-white flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600">💡</div>
                <div className="text-sm text-yellow-800">
                  <strong>คำแนะนำ:</strong> ต้องมีลูกอย่างน้อย 1 คนในระบบ • การลบลูกจะลบข้อมูลทั้งหมด • สีและอีโมจิจะแสดงใน
                  หน้าหลัก
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behaviors' && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">จัดการงานดี</h3>
            <p className="text-gray-600">ส่วนจัดการพฤติกรรมดีจะถูกพัฒนาในขั้นตอนถัดไป</p>
          </div>
        )}

        {activeTab === 'bad-behaviors' && (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">จัดการพฤติกรรมไม่ดี</h3>
            <p className="text-gray-600">ส่วนจัดการพฤติกรรมไม่ดีจะถูกพัฒนาในขั้นตอนถัดไป</p>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">จัดการรางวัล</h3>
            <p className="text-gray-600">ส่วนจัดการรางวัลจะถูกพัฒนาในขั้นตอนถัดไป</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
