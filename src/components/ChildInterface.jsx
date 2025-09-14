import React, { useState, useEffect } from "react";
import {
  Home,
  Star,
  Gift,
  Calendar,
  Trophy,
  Heart,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  Save,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
  const [behaviorCounts, setBehaviorCounts] = useState({});
  const [pendingPoints, setPendingPoints] = useState(0);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);

  useEffect(() => {
    setLoading(true);
    try {
      const points = calculateCurrentPoints(child.Id);
      setCurrentPoints(points);

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

  // คำนวณคะแนนที่จะได้รับจาก behaviorCounts
  useEffect(() => {
    let totalPending = 0;
    Object.entries(behaviorCounts).forEach(([behaviorId, count]) => {
      const behavior = familyBehaviors.find((b) => b.Id === behaviorId);
      if (behavior && count > 0) {
        totalPending += behavior.Points * count;
      }
    });
    setPendingPoints(totalPending);
  }, [behaviorCounts, familyBehaviors]);

  const handleBehaviorCountChange = (behaviorId, delta) => {
    setBehaviorCounts((prev) => {
      const currentCount = prev[behaviorId] || 0;
      const newCount = Math.max(0, currentCount + delta);
      return {
        ...prev,
        [behaviorId]: newCount,
      };
    });
  };

  const saveActivities = async () => {
    setSaving(true);
    try {
      let totalPointsEarned = 0;
      const newActivities = [];

      for (const [behaviorId, count] of Object.entries(behaviorCounts)) {
        if (count > 0) {
          const behavior = familyBehaviors.find((b) => b.Id === behaviorId);
          if (behavior) {
            for (let i = 0; i < count; i++) {
              const activity = await api.addActivity({
                itemId: behavior.Id,
                childId: child.Id,
                activityDate: today,
                activityType: behavior.Type,
                note: `${behavior.Name} - เพิ่มโดยเด็ก`,
                status: "Approved",
                approvedBy: family.Id,
              });
              newActivities.push(activity);
              totalPointsEarned += behavior.Points;
            }
          }
        }
      }

      // อัพเดทคะแนนรวม
      setCurrentPoints((prev) => prev + totalPointsEarned);

      // เพิ่มกิจกรรมใหม่
      setTodayActivities((prev) => [...newActivities, ...prev]);

      // รีเซ็ต counts
      setBehaviorCounts({});

      // แสดงผลสำเร็จ
      if (totalPointsEarned !== 0) {
        setSelectedBehavior({
          Name: `บันทึกกิจกรรมสำเร็จ`,
          Points: totalPointsEarned,
          Type: totalPointsEarned > 0 ? "Good" : "Bad",
        });

        setTimeout(() => {
          setSelectedBehavior(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save activities:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleRewardSelect = async (reward) => {
    try {
      const totalAvailablePoints = currentPoints + pendingPoints;
      if (totalAvailablePoints < reward.Cost) {
        alert("คะแนนไม่เพียงพอสำหรับรางวัลนี้");
        return;
      }

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

  // Summary component
  const ActivitySummary = () => {
    const totalActivities = Object.values(behaviorCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalActivities === 0) return null;

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          สรุปกิจกรรมที่จะบันทึก
        </h3>

        <div className="space-y-3 mb-6">
          {Object.entries(behaviorCounts)
            .filter(([_, count]) => count > 0)
            .map(([behaviorId, count]) => {
              const behavior = familyBehaviors.find((b) => b.Id === behaviorId);
              if (!behavior) return null;

              return (
                <div
                  key={behaviorId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: behavior.Color }}
                    />
                    <span className="font-medium text-gray-800">
                      {behavior.Name}
                    </span>
                    <span className="text-sm text-gray-600">x{count}</span>
                  </div>
                  <div
                    className={`font-bold ${
                      behavior.Points > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {behavior.Points > 0 ? "+" : ""}
                    {behavior.Points * count}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-800">
              คะแนนที่จะได้รับรวม:
            </span>
            <div
              className={`text-2xl font-bold flex items-center gap-2 ${
                pendingPoints > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {pendingPoints > 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              {pendingPoints > 0 ? "+" : ""}
              {pendingPoints}
            </div>
          </div>
        </div>

        <button
          onClick={saveActivities}
          disabled={saving || totalActivities === 0}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
            saving || totalActivities === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105"
          }`}
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              บันทึกกิจกรรม ({totalActivities} รายการ)
            </>
          )}
        </button>
      </div>
    );
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
              <RefreshCw
                className={`w-6 h-6 text-blue-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Enhanced Points Display */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-4 shadow-lg">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Star className="w-8 h-8 animate-pulse" />
                <span className="text-4xl font-bold">{currentPoints}</span>
                {pendingPoints !== 0 && (
                  <>
                    <span className="text-2xl">→</span>
                    <span className="text-3xl font-bold opacity-80">
                      {currentPoints + pendingPoints}
                    </span>
                  </>
                )}
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
              <p className="text-purple-100 font-medium">
                คะแนนปัจจุบัน
                {pendingPoints !== 0 && (
                  <span className="block text-sm opacity-80">
                    ({pendingPoints > 0 ? "+" : ""}
                    {pendingPoints} รอบันทึก)
                  </span>
                )}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">ถึงรางวัลถัดไป</span>
                <span className="font-bold text-purple-600">
                  {Math.max(0, 50 - (currentPoints + pendingPoints))} คะแนน
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      100,
                      ((currentPoints + pendingPoints) / 50) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      
        {/* Enhanced Tabs */}
        <div className="flex gap-3 mb-6 justify-center">
          {[
            { id: "good", label: "พฤติกรรมดี", icon: "✅", color: "green" },
            { id: "bad", label: "พฤติกรรมไม่ดี", icon: "❌", color: "red" },
            { id: "reward", label: "รางวัล", icon: "🎁", color: "purple" },
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
        <div className="space-y-4 mb-4">
          {tab === "good" && (
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
                พฤติกรรมดี
              </h3>
              <div className="grid gap-2">
                {familyBehaviors
                  .filter((b) => b.Type === "Good")
                  .map((behavior) => (
                    <BehaviorCard
                      key={behavior.Id}
                      behavior={behavior}
                      count={behaviorCounts[behavior.Id] || 0}
                      onIncrement={(id) => handleBehaviorCountChange(id, 1)}
                      onDecrement={(id) => handleBehaviorCountChange(id, -1)}
                    />
                  ))}
              </div>
            </div>
          )}

          {tab === "bad" && (
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✗</span>
                </div>
                พฤติกรรมไม่ดี
              </h3>
              <div className="grid gap-2">
                {familyBehaviors
                  .filter((b) => b.Type === "Bad")
                  .map((behavior) => (
                    <BehaviorCard
                      key={behavior.Id}
                      behavior={behavior}
                      count={behaviorCounts[behavior.Id] || 0}
                      onIncrement={(id) => handleBehaviorCountChange(id, 1)}
                      onDecrement={(id) => handleBehaviorCountChange(id, -1)}
                    />
                  ))}
              </div>
            </div>
          )}

          {tab === "reward" && (
            <div>
              <h3 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-3">
                <Gift className="w-8 h-8" />
                รางวัล
              </h3>
              <div className="grid gap-2">
                {familyRewards.map((reward) => (
                  <RewardCard
                    key={reward.Id}
                    reward={reward}
                    onSelect={handleRewardSelect}
                    childPoints={currentPoints + pendingPoints}
                  />
                ))}
              </div>
              {/* {Object.values(behaviorCounts).some((count) => count > 0) && (
                <ActivitySummary />
              )} */}
            </div>
          )}
        </div>
  {/* Activity Summary */}
        <ActivitySummary />

        {/* Today's Activities */}
        {todayActivities.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              กิจกรรมที่บันทึกแล้ววันนี้
            </h3>
            <div className="space-y-3">
              {todayActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.Id}
                  className="flex items-center gap-2 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full ${
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
                    {activity.EarnedPoints > 0 ? "+" : ""}
                    {activity.EarnedPoints}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Messages */}
        {selectedBehavior && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className={`p-8 rounded-3xl shadow-2xl text-center text-white text-xl font-bold animate-bounce max-w-sm mx-4 ${
                selectedBehavior.Type === "Good" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <div className="text-6xl mb-4">
                {selectedBehavior.Type === "Good" ? "🎉" : "😔"}
              </div>
              <div className="mb-2">{selectedBehavior.Name}</div>
              <div className="text-2xl font-extrabold">
                {selectedBehavior.Points > 0 ? "+" : ""}
                {selectedBehavior.Points} คะแนน
              </div>
            </div>
          </div>
        )}

        {selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-purple-500 p-8 rounded-3xl shadow-2xl text-center text-white text-xl font-bold animate-bounce max-w-sm mx-4">
              <div className="text-6xl mb-4">🎁</div>
              <div className="mb-2">ได้รับ {selectedReward.Name}!</div>
              <div className="text-2xl font-extrabold">ยินดีด้วย!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildInterface;
