// src/components/ChildInterface.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Gift, Smile, Frown, Trophy } from 'lucide-react';
import api from '../services/api';

// Avatar Component
const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-md ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff&size=150`;
        }}
      />
    </div>
  );
};

// BehaviorCard Component
const BehaviorCard = ({ behavior, onSelect, disabled = false }) => {
  const isGood = behavior.Type === 'Good';
  const bgColor = isGood ? 'from-green-100 to-green-200' : 'from-red-100 to-red-200';
  const textColor = isGood ? 'text-green-800' : 'text-red-800';
  const icon = isGood ? <Smile className="h-8 w-8" /> : <Frown className="h-8 w-8" />;
  
  return (
    <button
      onClick={() => onSelect(behavior)}
      disabled={disabled}
      className={`w-full p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-left ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
      } bg-gradient-to-br ${bgColor}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`${textColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${textColor} mb-1`}>
            {behavior.Name}
          </h3>
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${textColor}`} />
            <span className={`font-semibold ${textColor}`}>
              {behavior.Points > 0 ? '+' : ''}{behavior.Points} คะแนน
            </span>
          </div>
          {behavior.Category && (
            <p className={`text-sm ${textColor} opacity-75 mt-1`}>
              {behavior.Category}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

// RewardCard Component
const RewardCard = ({ reward, onSelect, canAfford = true }) => {
  return (
    <button
      onClick={() => onSelect(reward)}
      disabled={!canAfford}
      className={`w-full p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-left ${
        !canAfford ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:scale-105 cursor-pointer bg-gradient-to-br from-yellow-100 to-orange-200'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="text-orange-600">
          <Gift className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-800 mb-1">
            {reward.Name}
          </h3>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-800">
              {reward.Cost} คะแนน
            </span>
          </div>
          {reward.Description && (
            <p className="text-sm text-orange-700 opacity-75 mt-1">
              {reward.Description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

const ChildInterface = ({ family, child, onBack }) => {
  const [behaviors, setBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(child.currentPoints || 0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('good');
  const [notification, setNotification] = useState(null);

  // Load behaviors and rewards
  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goodBehaviors, badBehaviors, rewardsList] = await Promise.all([
        api.getGoodBehaviors(family.id),
        api.getBadBehaviors(family.id),
        api.getRewards(family.id)
      ]);
      
      setBehaviors([...goodBehaviors, ...badBehaviors]);
      setRewards(rewardsList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      setNotification({
        message: 'ไม่สามารถโหลดข้อมูลได้',
        type: 'error'
      });
    }
  };

  const handleBehaviorSelect = async (behavior) => {
    try {
      setLoading(true);
      
      await api.recordActivity({
        ChildId: child.id,
        ActivityType: behavior.Type,
        ItemId: behavior.Id,
        EarnedPoints: behavior.Points
      });

      const newPoints = currentPoints + behavior.Points;
      setCurrentPoints(newPoints);
      
      setNotification({
        message: `บันทึก "${behavior.Name}" เรียบร้อย! ${behavior.Points > 0 ? '+' : ''}${behavior.Points} คะแนน`,
        type: 'success'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error recording activity:', error);
      setLoading(false);
      setNotification({
        message: 'ไม่สามารถบันทึกกิจกรรมได้',
        type: 'error'
      });
    }
  };

  const handleRewardSelect = async (reward) => {
    if (currentPoints < reward.Cost) {
      setNotification({
        message: 'คะแนนไม่เพียงพอ!',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      await api.recordActivity({
        ChildId: child.id,
        ActivityType: 'Reward',
        ItemId: reward.Id,
        EarnedPoints: -reward.Cost
      });

      const newPoints = currentPoints - reward.Cost;
      setCurrentPoints(newPoints);
      
      setNotification({
        message: `แลกรางวัล "${reward.Name}" เรียบร้อย! -${reward.Cost} คะแนน`,
        type: 'success'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setLoading(false);
      setNotification({
        message: 'ไม่สามารถแลกรางวัลได้',
        type: 'error'
      });
    }
  };

  const goodBehaviors = behaviors.filter(b => b.Type === 'Good');
  const badBehaviors = behaviors.filter(b => b.Type === 'Bad');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-md transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>กลับไปหน้าหลัก</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <Avatar 
                src={child.avatarPath} 
                alt={child.name} 
                size="md"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {child.name}
                </h1>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-800">
                    {currentPoints} คะแนน
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 rounded-2xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('good')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'good' 
                ? 'bg-green-400 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Smile className="h-5 w-5" />
            <span className="font-medium">พฤติกรรมดี</span>
          </button>
          <button
            onClick={() => setActiveTab('bad')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'bad' 
                ? 'bg-red-400 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Frown className="h-5 w-5" />
            <span className="font-medium">พฤติกรรมไม่ดี</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'rewards' 
                ? 'bg-yellow-400 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Gift className="h-5 w-5" />
            <span className="font-medium">รางวัล</span>
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {/* Good Behaviors */}
            {activeTab === 'good' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Smile className="h-6 w-6 text-green-500" />
                  <span>พฤติกรรมดี</span>
                </h2>
                {goodBehaviors.length > 0 ? (
                  <div className="grid gap-4">
                    {goodBehaviors.map((behavior) => (
                      <BehaviorCard
                        key={behavior.Id}
                        behavior={behavior}
                        onSelect={handleBehaviorSelect}
                        disabled={loading}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีพฤติกรรมดี</p>
                )}
              </div>
            )}

            {/* Bad Behaviors */}
            {activeTab === 'bad' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Frown className="h-6 w-6 text-red-500" />
                  <span>พฤติกรรมไม่ดี</span>
                </h2>
                {badBehaviors.length > 0 ? (
                  <div className="grid gap-4">
                    {badBehaviors.map((behavior) => (
                      <BehaviorCard
                        key={behavior.Id}
                        behavior={behavior}
                        onSelect={handleBehaviorSelect}
                        disabled={loading}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีพฤติกรรมไม่ดี</p>
                )}
              </div>
            )}

            {/* Rewards */}
            {activeTab === 'rewards' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>รางวัล</span>
                </h2>
                {rewards.length > 0 ? (
                  <div className="grid gap-4">
                    {rewards.map((reward) => (
                      <RewardCard
                        key={reward.Id}
                        reward={reward}
                        onSelect={handleRewardSelect}
                        canAfford={currentPoints >= reward.Cost && !loading}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีรางวัล</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildInterface;