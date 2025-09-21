// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Users, Trophy, Gift, LogOut, Star } from "lucide-react";

// Import existing components
import BehaviorCard from "./BehaviorCard";
import RewardCard from "./RewardCard";

// Import API service and constants
import api from "../services/api";
import { behaviorCategories, rewardCategories } from "../constants/constants";

// Suppress ResizeObserver errors properly
const suppressResizeObserverErrors = () => {
  const resizeObserverErrorHandler = (e) => {
    if (
      e.message === 'ResizeObserver loop limit exceeded' ||
      e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message.includes('ResizeObserver')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  window.addEventListener('error', resizeObserverErrorHandler, true);
  window.addEventListener('unhandledrejection', resizeObserverErrorHandler, true);
  
  // Cleanup function
  return () => {
    window.removeEventListener('error', resizeObserverErrorHandler, true);
    window.removeEventListener('unhandledrejection', resizeObserverErrorHandler, true);
  };
};

const AdminDashboard = ({ 
  family, 
  onLogout = () => {}, 
  onSelectChild = () => {} 
}) => {
  const [activeTab, setActiveTab] = useState("children");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [children, setChildren] = useState(family?.children || []);
  const [behaviors, setBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);

  // Modal States
  const [showChildModal, setShowChildModal] = useState(false);
  const [showBehaviorModal, setShowBehaviorModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [childForm, setChildForm] = useState({
    name: '', age: '', gender: '', avatarPath: ''
  });
  const [behaviorForm, setBehaviorForm] = useState({
    name: '', points: '', type: 'Good', category: '', color: '#8B5CF6', isRepeatable: true
  });
  const [rewardForm, setRewardForm] = useState({
    name: '', cost: '', category: '', color: '#F59E0B'
  });

  // Setup error suppression on mount
  useEffect(() => {
    const cleanup = suppressResizeObserverErrors();
    return cleanup;
  }, []);

  // Load data on mount
  useEffect(() => {
    console.log('AdminDashboard received family:', family);
    
    if (family?.id) {
      if (family.children && family.children.length > 0) {
        setChildren(family.children);
        console.log('Using children from family prop:', family.children);
      }
      loadAdditionalData();
    }
  }, [family]);

  const loadAdditionalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [behaviorsData, rewardsData] = await Promise.all([
        api.getBehaviors(family.id),
        api.getRewards(family.id)
      ]);

      setBehaviors(behaviorsData || []);
      setRewards(rewardsData || []);

      console.log('Loaded behaviors:', behaviorsData);
      console.log('Loaded rewards:', rewardsData);

    } catch (error) {
      console.error("Error loading additional data:", error);
      setError("ไม่สามารถโหลดข้อมูลพฤติกรรมและรางวัลได้");
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const getTotalFamilyPoints = () => {
    return children.reduce((sum, child) => {
      const points = child.currentPoints || 0;
      return sum + points;
    }, 0);
  };

  const resetForms = () => {
    setChildForm({ name: '', age: '', gender: '', avatarPath: '' });
    setBehaviorForm({ name: '', points: '', type: 'Good', category: '', color: '#8B5CF6', isRepeatable: true });
    setRewardForm({ name: '', cost: '', category: '', color: '#F59E0B' });
    setEditingItem(null);
  };

  // Modal Handlers
  const handleOpenChildModal = (child = null) => {
    if (child) {
      setChildForm({
        name: child.name || '',
        age: child.age || '',
        gender: child.gender || '',
        avatarPath: child.avatarPath || ''
      });
      setEditingItem(child);
    } else {
      resetForms();
    }
    setShowChildModal(true);
  };

  const handleOpenBehaviorModal = (behavior = null) => {
    if (behavior) {
      setBehaviorForm({
        name: behavior.name || behavior.Name || '',
        points: Math.abs(behavior.points || behavior.Points || ''),
        type: behavior.type || behavior.Type || 'Good',
        category: behavior.category || behavior.Category || '',
        color: behavior.color || behavior.Color || '#8B5CF6',
        isRepeatable: behavior.isRepeatable ?? behavior.IsRepeatable ?? true
      });
      setEditingItem(behavior);
    } else {
      resetForms();
    }
    setShowBehaviorModal(true);
  };

  const handleOpenRewardModal = (reward = null) => {
    if (reward) {
      setRewardForm({
        name: reward.name || reward.Name || '',
        cost: reward.cost || reward.Cost || '',
        category: reward.category || reward.Category || '',
        color: reward.color || reward.Color || '#F59E0B'
      });
      setEditingItem(reward);
    } else {
      resetForms();
    }
    setShowRewardModal(true);
  };

  // CRUD Operations
  const handleChildSubmit = async () => {
    try {
      if (!childForm.name || !childForm.age || !childForm.gender) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      setLoading(true);
      const childData = {
        ...childForm,
        age: parseInt(childForm.age),
        familyId: family.id,
      };

      if (editingItem) {
        const updatedChild = { ...editingItem, ...childData };
        setChildren(children.map(c => c.id === editingItem.id ? updatedChild : c));
        alert('แก้ไขข้อมูลเด็กสำเร็จ!');
      } else {
        const newChild = { ...childData, id: `C${Date.now()}`, currentPoints: 0 };
        setChildren([...children, newChild]);
        alert('เพิ่มเด็กใหม่สำเร็จ!');
      }
      
      setShowChildModal(false);
      resetForms();
    } catch (error) {
      console.error("Error saving child:", error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleBehaviorSubmit = async () => {
    try {
      if (!behaviorForm.name || !behaviorForm.points) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      setLoading(true);
      const behaviorData = {
        name: behaviorForm.name,
        points: parseInt(behaviorForm.points) * (behaviorForm.type === "Bad" ? -1 : 1),
        type: behaviorForm.type,
        category: behaviorForm.category,
        color: behaviorForm.color,
        isRepeatable: behaviorForm.isRepeatable,
        familyId: family.id,
      };

      if (editingItem) {
        const updatedBehavior = { ...editingItem, ...behaviorData };
        setBehaviors(behaviors.map(b => b.id === editingItem.id ? updatedBehavior : b));
        alert('แก้ไขพฤติกรรมสำเร็จ!');
      } else {
        const newBehavior = { ...behaviorData, id: `B${Date.now()}` };
        setBehaviors([...behaviors, newBehavior]);
        alert('เพิ่มพฤติกรรมใหม่สำเร็จ!');
      }
      
      setShowBehaviorModal(false);
      resetForms();
    } catch (error) {
      console.error("Error saving behavior:", error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleRewardSubmit = async () => {
    try {
      if (!rewardForm.name || !rewardForm.cost) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      setLoading(true);
      const rewardData = {
        name: rewardForm.name,
        cost: parseInt(rewardForm.cost),
        category: rewardForm.category,
        color: rewardForm.color,
        familyId: family.id,
      };

      if (editingItem) {
        const updatedReward = { ...editingItem, ...rewardData };
        setRewards(rewards.map(r => r.id === editingItem.id ? updatedReward : r));
        alert('แก้ไขรางวัลสำเร็จ!');
      } else {
        const newReward = { ...rewardData, id: `R${Date.now()}` };
        setRewards([...rewards, newReward]);
        alert('เพิ่มรางวัลใหม่สำเร็จ!');
      }
      
      setShowRewardModal(false);
      resetForms();
    } catch (error) {
      console.error("Error saving reward:", error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, item) => {
    if (window.confirm(`ต้องการลบ${type}นี้หรือไม่?`)) {
      if (type === 'เด็ก') {
        setChildren(children.filter(c => c.id !== item.id));
      } else if (type === 'พฤติกรรม') {
        setBehaviors(behaviors.filter(b => b.id !== item.id));
      } else if (type === 'รางวัล') {
        setRewards(rewards.filter(r => r.id !== item.id));
      }
      alert(`ลบ${type}สำเร็จ!`);
    }
  };

  // Render child card with center alignment
  const renderChildCard = (child) => (
    <div 
      key={child.id}
      className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 relative"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar - Center */}
        <div className="relative">
          <img 
            src={child.avatarPath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`}
            alt={child.name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=random`;
            }}
          />
        </div>

        {/* Info - Center */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">อายุ {child.age} ปี</p>
            <p className="text-sm text-gray-600">เพศ: {child.gender === 'M' ? 'ชาย' : 'หญิง'}</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold shadow-lg">
            <Star className="w-4 h-4" />
            {child.currentPoints || 0} คะแนน
          </div>
        </div>

        {/* Action buttons - Center */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={() => onSelectChild && onSelectChild(child)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all font-medium"
          >
            เข้าใช้งาน
          </button>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleOpenChildModal(child)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => handleDelete('เด็ก', child)}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render behavior card with vibrant colors
  const renderBehaviorCard = (behavior) => {
    const isGood = (behavior.type || behavior.Type) === "Good";
    const points = behavior.points || behavior.Points;
    const name = behavior.name || behavior.Name;
    const category = behavior.category || behavior.Category;
    const color = behavior.color || behavior.Color;
    const isRepeatable = behavior.isRepeatable ?? behavior.IsRepeatable ?? true;

    return (
      <div key={behavior.id} className="relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            {/* Color indicator */}
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 shadow-md"
              style={{ backgroundColor: color || (isGood ? '#10B981' : '#EF4444') }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                {category && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {category}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  isGood 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                }`}>
                  <Star className="w-3 h-3" />
                  {isGood ? '+' : ''}{Math.abs(points)} คะแนน
                </div>
                
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isRepeatable 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {isRepeatable ? 'ทำซ้ำได้' : 'ทำได้ครั้งเดียว/วัน'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenBehaviorModal(behavior)}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleDelete('พฤติกรรม', behavior)}
                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render reward card
  const renderRewardCard = (reward) => (
    <div key={reward.id} className="relative">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <RewardCard 
          reward={reward}
          canAfford={true}
          disabled={false}
          onSelect={() => {}}
        />
        
        {/* Action buttons overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => handleOpenRewardModal(reward)}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete('รางวัล', reward)}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );

  // Custom Modal Component
  const Modal = ({ show, title, onClose, onSave, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {children}
          </div>
          
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !children.length && !behaviors.length && !rewards.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">เกิดข้อผิดพลาด</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}

        {/* Header with logout button in top right */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 relative">
          {/* Logout button - top right */}
          <button
            onClick={onLogout}
            className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-4 pr-16">
            <div className="text-4xl">
              {family?.avatarPath || '👨‍👩‍👧‍👦'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{family?.name}</h1>
              <p className="text-gray-600">{family?.email}</p>
              <p className="text-gray-600">{family?.phone}</p>
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold shadow-lg">
                  ⭐ รวม {getTotalFamilyPoints()} คะแนน
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {children.length} เด็ก
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {[
              { key: 'children', label: 'เด็กในครอบครัว', icon: Users, count: children.length },
              { key: 'behaviors', label: 'พฤติกรรม', icon: Trophy, count: behaviors.length },
              { key: 'rewards', label: 'รางวัล', icon: Gift, count: rewards.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Children Tab */}
            {activeTab === 'children' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">เด็กในครอบครัว</h2>
                  <button
                    onClick={() => handleOpenChildModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเด็ก
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {children.map(renderChildCard)}
                </div>
                
                {children.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">ยังไม่มีเด็กในครอบครัว</h3>
                    <p className="text-sm">คลิก "เพิ่มเด็ก" เพื่อเริ่มต้น</p>
                  </div>
                )}
              </div>
            )}

            {/* Behaviors Tab */}
            {activeTab === 'behaviors' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">พฤติกรรม</h2>
                  <button
                    onClick={() => handleOpenBehaviorModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มพฤติกรรม
                  </button>
                </div>
                
                <div className="space-y-4">
                  {behaviors.map(renderBehaviorCard)}
                </div>
                
                {behaviors.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">ยังไม่มีพฤติกรรมที่กำหนด</h3>
                    <p className="text-sm">คลิก "เพิ่มพฤติกรรม" เพื่อเริ่มต้น</p>
                  </div>
                )}
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">รางวัล</h2>
                  <button
                    onClick={() => handleOpenRewardModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มรางวัล
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rewards.map(renderRewardCard)}
                </div>
                
                {rewards.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">ยังไม่มีรางวัลที่กำหนด</h3>
                    <p className="text-sm">คลิก "เพิ่มรางวัล" เพื่อเริ่มต้น</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9998]">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">กำลังประมวลผล...</p>
              </div>
            </div>
          </div>
        )}

        {/* Child Modal */}
        <Modal
          show={showChildModal}
          title={editingItem ? "แก้ไขข้อมูลเด็ก" : "เพิ่มเด็กใหม่"}
          onClose={() => {
            setShowChildModal(false);
            resetForms();
          }}
          onSave={handleChildSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเด็ก *</label>
              <input
                type="text"
                value={childForm.name}
                onChange={(e) => setChildForm({...childForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="กรุณากรอกชื่อเด็ก"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อายุ *</label>
                <input
                  type="number"
                  value={childForm.age}
                  onChange={(e) => setChildForm({...childForm, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="อายุ"
                  min="1"
                  max="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เพศ *</label>
                <select
                  value={childForm.gender}
                  onChange={(e) => setChildForm({...childForm, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">เลือกเพศ</option>
                  <option value="M">ชาย</option>
                  <option value="F">หญิง</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปโปรไฟล์</label>
              <input
                type="text"
                value={childForm.avatarPath}
                onChange={(e) => setChildForm({...childForm, avatarPath: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="URL รูปภาพ หรือเว้นว่างสำหรับรูปเริ่มต้น"
              />
            </div>
          </div>
        </Modal>

        {/* Behavior Modal */}
        <Modal
          show={showBehaviorModal}
          title={editingItem ? "แก้ไขพฤติกรรม" : "เพิ่มพฤติกรรมใหม่"}
          onClose={() => {
            setShowBehaviorModal(false);
            resetForms();
          }}
          onSave={handleBehaviorSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อพฤติกรรม *</label>
              <input
                type="text"
                value={behaviorForm.name}
                onChange={(e) => setBehaviorForm({...behaviorForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="กรุณากรอกชื่อพฤติกรรม"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                <select
                  value={behaviorForm.type}
                  onChange={(e) => setBehaviorForm({...behaviorForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Good">พฤติกรรมดี</option>
                  <option value="Bad">พฤติกรรมไม่ดี</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คะแนน *</label>
                <input
                  type="number"
                  value={behaviorForm.points}
                  onChange={(e) => setBehaviorForm({...behaviorForm, points: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="จำนวนคะแนน"
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  value={behaviorForm.category}
                  onChange={(e) => setBehaviorForm({...behaviorForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {behaviorCategories?.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                <input
                  type="color"
                  value={behaviorForm.color}
                  onChange={(e) => setBehaviorForm({...behaviorForm, color: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={behaviorForm.isRepeatable}
                  onChange={(e) => setBehaviorForm({...behaviorForm, isRepeatable: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">สามารถทำซ้ำได้</span>
              </label>
            </div>
          </div>
        </Modal>

        {/* Reward Modal */}
        <Modal
          show={showRewardModal}
          title={editingItem ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
          onClose={() => {
            setShowRewardModal(false);
            resetForms();
          }}
          onSave={handleRewardSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อรางวัล *</label>
              <input
                type="text"
                value={rewardForm.name}
                onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="กรุณากรอกชื่อรางวัล"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (คะแนน) *</label>
                <input
                  type="number"
                  value={rewardForm.cost}
                  onChange={(e) => setRewardForm({...rewardForm, cost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="จำนวนคะแนนที่ใช้แลก"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  value={rewardForm.category}
                  onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {rewardCategories?.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
              <input
                type="color"
                value={rewardForm.color}
                onChange={(e) => setRewardForm({...rewardForm, color: e.target.value})}
                className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;