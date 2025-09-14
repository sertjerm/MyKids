import React, { useState, useEffect } from "react";
import { Home, Star, Gift, Calendar } from "lucide-react";
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

// Child Interface
const ChildInterface = ({ family, child, onBack }) => {
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);
  const [tab, setTab] = useState("good"); // "good", "bad", "reward"

  const today = new Date().toISOString().split("T")[0];
  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);

  useEffect(() => {
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
      }, 2000);
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
      }, 2000);
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen p-4 bg-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="text-center flex-1">
              <Avatar emoji={child.AvatarPath} size="xl" />
              <h2 className="text-xl font-bold text-gray-800 mt-2">
                {child.Name}
              </h2>
              <p className="text-gray-600">อายุ {child.Age} ปี</p>
            </div>
            <div className="w-8" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <Star className="w-8 h-8 inline mr-2" />
              {currentPoints}
            </div>
            <p className="text-gray-600">คะแนนทั้งหมด</p>
          </div>
        </div>

        {/* Today's Activities Summary */}
        {todayActivities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              กิจกรรมวันนี้
            </h3>
            <div className="space-y-2">
              {todayActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.Id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.ActivityType === "Good"
                        ? "bg-green-400"
                        : activity.ActivityType === "Bad"
                        ? "bg-red-400"
                        : "bg-purple-400"
                    }`}
                  />
                  <span className="flex-1">{activity.Note}</span>
                  <span
                    className={`font-semibold ${
                      activity.EarnedPoints > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {activity.EarnedPoints > 0 ? "+" : ""}
                    {activity.EarnedPoints}
                  </span>
                </div>
              ))}
              {todayActivities.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  และอีก {todayActivities.length - 3} กิจกรรม
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all
              ${
                tab === "good"
                  ? "bg-green-500 text-white shadow"
                  : "bg-white border border-green-300 text-green-700 hover:bg-green-50"
              }
            `}
            onClick={() => setTab("good")}
          >
            พฤติกรรมดี
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all
              ${
                tab === "bad"
                  ? "bg-red-500 text-white shadow"
                  : "bg-white border border-red-300 text-red-700 hover:bg-red-50"
              }
            `}
            onClick={() => setTab("bad")}
          >
            พฤติกรรมไม่ดี
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all
              ${
                tab === "reward"
                  ? "bg-purple-500 text-white shadow"
                  : "bg-white border border-purple-300 text-purple-700 hover:bg-purple-50"
              }
            `}
            onClick={() => setTab("reward")}
          >
            รางวัล
          </button>
        </div>

        {/* Tab Content */}
        {tab === "good" && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              พฤติกรรมดี
            </h3>
            <div className="grid gap-3">
              {familyBehaviors
                .filter((b) => b.Type === "Good")
                .map((behavior) => (
                  <BehaviorCard
                    key={behavior.Id}
                    behavior={behavior}
                    onSelect={handleBehaviorSelect}
                    selected={selectedBehavior?.Id === behavior.Id}
                    disabled={!canPerformBehavior(child.Id, behavior.Id, today)}
                  />
                ))}
            </div>
          </div>
        )}

        {tab === "bad" && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✗</span>
              </div>
              พฤติกรรมไม่ดี
            </h3>
            <div className="grid gap-3">
              {familyBehaviors
                .filter((b) => b.Type === "Bad")
                .map((behavior) => (
                  <BehaviorCard
                    key={behavior.Id}
                    behavior={behavior}
                    onSelect={handleBehaviorSelect}
                    selected={selectedBehavior?.Id === behavior.Id}
                  />
                ))}
            </div>
          </div>
        )}

        {tab === "reward" && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              รางวัล
            </h3>
            <div className="grid gap-3">
              {familyRewards.map((reward) => (
                <RewardCard
                  key={reward.Id}
                  reward={reward}
                  onSelect={handleRewardSelect}
                  childPoints={currentPoints}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success Messages */}
        {selectedBehavior && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg ${
              selectedBehavior.Type === "Good"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {selectedBehavior.Type === "Good" ? "🎉" : "😔"}{" "}
            {selectedBehavior.Name} {selectedBehavior.Points > 0 ? "+" : ""}
            {selectedBehavior.Points}
          </div>
        )}

        {selectedReward && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg bg-purple-500 text-white">
            🎁 ได้รับ {selectedReward.Name}!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildInterface;
