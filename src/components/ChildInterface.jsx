import React, { useState, useEffect } from "react";
import { Home, Star, Gift, Calendar, Trophy, Heart, Sparkles, RefreshCw } from "lucide-react";
import Avatar from "./Avatar";
import BehaviorCard from "./BehaviorCard";
import RewardCard from "./RewardCard";
import mockData, {
  getBehaviorsByFamily,
  getRewardsByFamily,
  calculateCurrentPoints,
  canPerformBehavior,
  canRedeemReward,
} from "../data/mockData";
import api from "../services/api";

const ChildInterface = ({ family, child, onBack }) => {
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);
  const [tab, setTab] = useState("good");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);

  useEffect(() => {
    setLoading(true);
    try {
      // Calculate current points
      const points = calculateCurrentPoints(child.Id);
      setCurrentPoints(points);

      // Load today's activities
      const activities = mockData.mockDailyActivities.filter(
        (activity) =>
          activity.ChildId === child.Id &&
          activity.ActivityDate === today &&
          activity.Status === "Approved"
      );
      setTodayActivities(activities);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [child.Id, today]);

  const handleBehaviorSelect = async (behavior) => {
    try {
      // Check if behavior can be performed
      if (!canPerformBehavior(child.Id, behavior.Id, today)) {
        alert("พฤติกรรมนี้ทำครบแล้วสำหรับวันนี้");
        return;
      }

      // Add activity
      const activity = await api.addActivity({
        itemId: behavior.Id,
        childId: child.Id,
        activityDate: today,
        activityType: behavior.Type,
        note: `${behavior.Name} - เพิ่มโดยเด็ก`,
        status: "Approved",
        approvedBy: family.Id,
      });

      // Update points
      const newPoints = currentPoints + behavior.Points;
      setCurrentPoints(newPoints);
      setSelectedBehavior(behavior);

      // Add to today's activities
      setTodayActivities((prev) => [activity, ...prev]);

      // Clear selection after animation
      setTimeout(() => {
        setSelectedBehavior(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to add behavior:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleRewardSelect = async (reward) => {
    try {
      if (!canRedeemReward(child.Id, reward.Id)) {
        alert("คะแนนไม่เพียงพอสำหรับรางวัลนี้");
        return;
      }

      // Add reward activity
      const activity = await api.addActivity({
        itemId: reward.Id,
        childId: child.Id,
        activityDate: today,
        activityType: "Reward",
        note: `แลก ${reward.Name}`,
        status: "Approved",
        approvedBy: family.Id,
      });

      const newPoints = currentPoints - reward.Cost;
      setCurrentPoints(newPoints);
      setSelectedReward(reward);

      // Add to today's activities
      setTodayActivities((prev) => [activity, ...prev]);

      setTimeout(() => {
        setSelectedReward(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-300 hover:scale-110"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="text-center flex-1">
              <div className="relative inline-block mb-4">
                <Avatar emoji={child.AvatarPath} size="xl" />
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
                  {child.Age}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {child.Name}
              </h2>
              <p className="text-gray-600">อายุ {child.Age} ปี</p>
            </div>
            
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-3 rounded-2xl bg-blue-100/80 hover:bg-blue-200/80 transition-all duration-300 hover:scale-110 disabled:opacity-50"
            >
              <RefreshCw className={`w-6 h-6 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Enhanced Points Display */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-4 shadow-lg">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Star className="w-8 h-8 animate-pulse" />
                <span className="text-4xl font-bold">{currentPoints}</span>
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
              <p className="text-purple-100 font-medium">คะแนนทั้งหมด</p>
            </div>
            
            {/* Progress to next reward */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">ถึงรางวัลถัดไป</span>
                <span className="font-bold text-purple-600">{Math.max(0, 50 - currentPoints)} คะแนน</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${Math.min(100, (currentPoints / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Today's Activities */}
        {todayActivities.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              กิจกรรมวันนี้
              <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
            </h3>
            <div className="space-y-3">
              {todayActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.Id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full animate-pulse ${
                        activity.ActivityType === "Good"
                          ? "bg-green-400"
                          : activity.ActivityType === "Bad"
                          ? "bg-red-400"
                          : "bg-purple-400"
                      }`}
                    />
                  </div>
                  <span className="flex-1 text-gray-700">{activity.Note}</span>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      activity.EarnedPoints > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {activity.EarnedPoints > 0 ? "+" : ""}{activity.EarnedPoints}
                  </div>
                </div>
              ))}
              {todayActivities.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  และอีก {todayActivities.length - 5} กิจกรรม
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="flex gap-3 mb-6 justify-center">
          {[
            { id: "good", label: "พฤติกรรมดี", icon: "✅", color: "green" },
            { id: "bad", label: "พฤติกรรมไม่ดี", icon: "❌", color: "red" },
            { id: "reward", label: "รางวัล", icon: "🎁", color: "purple" }
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform ${
                tab === tabItem.id
                  ? tabItem.color === "green"
                    ? "bg-green-500 text-white shadow-lg scale-110"
                    : tabItem.color === "red" 
                    ? "bg-red-500 text-white shadow-lg scale-110"
                    : "bg-purple-500 text-white shadow-lg scale-110"
                  : tabItem.color === "green"
                    ? "bg-white/90 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:scale-105"
                    : tabItem.color === "red"
                    ? "bg-white/90 border-2 border-red-200 text-red-700 hover:bg-red-50 hover:scale-105"
                    : "bg-white/90 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:scale-105"
              }`}
              onClick={() => setTab(tabItem.id)}
            >
              <span className="text-lg">{tabItem.icon}</span>
              <span>{tabItem.label}</span>
            </button>
          ))}
        </div>

        {/* Enhanced Tab Content */}
        <div className="space-y-4">
          {tab === "good" && (
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg">✓</span>
                </div>
                พฤติกรรมดี
                <Heart className="w-6 h-6 text-pink-500 animate-bounce" />
              </h3>
              <div className="grid gap-4">
                {familyBehaviors
                  .filter((b) => b.Type === "Good")
                  .map((behavior) => (
                    <div
                      key={behavior.Id}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <BehaviorCard
                        behavior={behavior}
                        onSelect={handleBehaviorSelect}
                        selected={selectedBehavior?.Id === behavior.Id}
                        disabled={!canPerformBehavior(child.Id, behavior.Id, today)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {tab === "bad" && (
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg">✗</span>
                </div>
                พฤติกรรมไม่ดี
              </h3>
              <div className="grid gap-4">
                {familyBehaviors
                  .filter((b) => b.Type === "Bad")
                  .map((behavior) => (
                    <div
                      key={behavior.Id}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <BehaviorCard
                        behavior={behavior}
                        onSelect={handleBehaviorSelect}
                        selected={selectedBehavior?.Id === behavior.Id}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {tab === "reward" && (
            <div>
              <h3 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-3">
                <Gift className="w-8 h-8 animate-bounce" />
                รางวัล
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </h3>
              <div className="grid gap-4">
                {familyRewards.map((reward) => (
                  <div
                    key={reward.Id}
                    className="transform transition-all duration-300 hover:scale-105"
                  >
                    <RewardCard
                      reward={reward}
                      onSelect={handleRewardSelect}
                      childPoints={currentPoints}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Success Messages */}
        {selectedBehavior && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-3xl shadow-2xl text-center text-white text-xl font-bold animate-bounce max-w-sm mx-4 ${
              selectedBehavior.Type === "Good" ? "bg-green-500" : "bg-red-500"
            }`}>
              <div className="text-6xl mb-4 animate-pulse">
                {selectedBehavior.Type === "Good" ? "🎉" : "😔"}
              </div>
              <div className="mb-2">{selectedBehavior.Name}</div>
              <div className="text-2xl font-extrabold">
                {selectedBehavior.Points > 0 ? "+" : ""}{selectedBehavior.Points} คะแนน
              </div>
              <div className="mt-4 text-base opacity-80">
                {selectedBehavior.Type === "Good" ? "ยอดเยี่ยม! เก่งมาก!" : "ครั้งหน้าระวังนะ"}
              </div>
            </div>
          </div>
        )}

        {selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-purple-500 p-8 rounded-3xl shadow-2xl text-center text-white text-xl font-bold animate-bounce max-w-sm mx-4">
              <div className="text-6xl mb-4 animate-spin">🎁</div>
              <div className="mb-2">ได้รับ {selectedReward.Name}!</div>
              <div className="text-2xl font-extrabold">ยินดีด้วย! 🎊</div>
              <div className="mt-4 text-base opacity-80">
                ใช้คะแนนไป {selectedReward.Cost} คะแนน
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildInterface;