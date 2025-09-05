import React, { useState, useEffect } from 'react';
import { Settings, Home, Users, Star } from 'lucide-react';

const Navigation = ({ currentView, setCurrentView, selectedChild, setSelectedChild }) => {
  const [children] = useState([
    { id: 'child_001', name: 'น้องพีฟ่า', age: 11 },
    { id: 'child_002', name: 'น้องพีฟอง', age: 10 }
  ]);

  useEffect(() => {
    if (!selectedChild && children.length > 0) {
      setSelectedChild(children[0].id);
    }
  }, [selectedChild, setSelectedChild, children]);

  return (
    <div className="card-pastel mb-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-2xl font-bold text-primary-600 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500 animate-pulse-slow" />
            🌈 MyKids
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('admin')}
              className={`btn-pastel flex items-center gap-2 ${
                currentView === 'admin' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-primary-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">ระบบจัดการ</span> Admin
            </button>
            
            <button
              onClick={() => setCurrentView('child')}
              className={`btn-pastel flex items-center gap-2 ${
                currentView === 'child' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white text-primary-600'
              }`}
            >
              <Users className="w-4 h-4" />
              หน้าเด็ก
            </button>
          </div>
        </div>

        {currentView === 'child' && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">เลือกเด็ก:</span>
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.age} ขวบ)
                </option>
              ))}
            </select>
          </div>
        )}

        <button className="btn-pastel bg-pastel-green text-green-800 flex items-center gap-2">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">กลับ</span>หน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default Navigation;
