// src/components/ChildInterface.jsx
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
import BehaviorItem from "./BehaviorItem"; // เพิ่มบรรทัดนี้
import RewardItem from "./RewardItem"; // ✅ เพิ่ม import RewardItem
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
  const [familyBehaviors, setFamilyBehaviors] = useState([]);
  const [familyRewards, setFamilyRewards] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [child.id || child.Id, family.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [behaviors, rewards, activities] = await Promise.all([
        api.getBehaviors(family.id),
        api.getRewards(family.id),
        api.getDailyActivities(child.id || child.Id, today),
      ]);

      setFamilyBehaviors(behaviors || []);
      setFamilyRewards(rewards || []);
      setTodayActivities(activities || []);

      // ⭐ เพิ่มการดึงคะแนนรวมล่าสุด
      try {
        const pointsData = await api.getChildTotalPoints(child.id || child.Id);
        setCurrentPoints(pointsData.totalPoints);
      } catch (error) {
        console.error("Failed to get total points:", error);
        setCurrentPoints(child.currentPoints || 0);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setCurrentPoints(child.currentPoints || 0);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBehaviorToggle = (behaviorId) => {
    setBehaviorCounts((prev) => {
      const currentCount = prev[behaviorId] || 0;
      return {
        ...prev,
        [behaviorId]: currentCount === 0 ? 1 : 0,
      };
    });
  };

  const saveActivities = async () => {
    setSaving(true);
    try {
      const promises = [];

      // บันทึกกิจกรรมแต่ละพฤติกรรม
      Object.entries(behaviorCounts).forEach(([behaviorId, count]) => {
        if (count > 0) {
          const behavior = familyBehaviors.find((b) => b.Id === behaviorId);
          if (behavior) {
            for (let i = 0; i < count; i++) {
              promises.push(
                api.recordActivity({
                  ChildId: child.id || child.Id,
                  ActivityType: behavior.Type,
                  ItemId: behaviorId,
                  EarnedPoints: behavior.Points,
                })
              );
            }
          }
        }
      });

      await Promise.all(promises);

      // ⭐ รีเซ็ต counts ก่อน
      setBehaviorCounts({});
      setPendingPoints(0);

      // ⭐ ดึงคะแนนล่าสุดจาก API แทนการบวกเอง
      const pointsData = await api.getChildTotalPoints(child.id || child.Id);
      setCurrentPoints(pointsData.totalPoints);

      // รีโหลดข้อมูลกิจกรรม
      await loadData();
    } catch (error) {
      console.error("Failed to save activities:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleRewardRedeem = async (reward) => {
    if (currentPoints < reward.Cost) {
      alert("คะแนนไม่เพียงพอสำหรับรางวัลนี้");
      return;
    }

    setSaving(true);
    try {
      await api.recordActivity({
        ChildId: child.id || child.Id,
        ActivityType: "Reward",
        ItemId: reward.Id,
        EarnedPoints: -reward.Cost,
      });

      setCurrentPoints(currentPoints - reward.Cost);
      await loadData();
      alert(`แลกรางวัล "${reward.Name}" เรียบร้อยแล้ว!`);
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const goodBehaviors = familyBehaviors.filter((b) => b.Type === "Good");
  const badBehaviors = familyBehaviors.filter((b) => b.Type === "Bad");
  const totalPendingActivities = Object.values(behaviorCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="card-bg-glass backdrop-blur-sm rounded-2xl card-shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>กลับหน้าหลัก</span>
            </button>

            <div className="flex items-center gap-4 text-center">
              <Avatar emoji={child.avatarPath || child.AvatarPath} size="lg" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {child.name || child.Name}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold text-purple-600">
                    {currentPoints} คะแนน
                  </span>
                  {pendingPoints !== 0 && (
                    <span
                      className={`text-sm ${
                        pendingPoints > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ({pendingPoints > 0 ? "+" : ""}
                      {pendingPoints})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-bg-glass backdrop-blur-sm rounded-2xl card-shadow mb-6 overflow-hidden">
          <div className="flex">
            {[
              {
                id: "good",
                label: "พฤติกรรมดี",
                icon: Heart,
                color: "text-green-600",
              },
              {
                id: "bad",
                label: "พฤติกรรมไม่ดี",
                icon: TrendingDown,
                color: "text-red-600",
              },
              {
                id: "rewards",
                label: "รางวัล",
                icon: Gift,
                color: "text-purple-600",
              },
            ].map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                    tab === tabItem.id
                      ? `${tabItem.color} border-b-2 border-current bg-gray-50`
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{tabItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="card-bg-glass backdrop-blur-sm rounded-2xl card-shadow p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Good Behaviors */}
              {tab === "good" && (
                <div>
                  <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    พฤติกรรมดี ({goodBehaviors.length} รายการ)
                  </h2>
                  <div className="space-y-4">
                    {goodBehaviors.map((behavior) => (
                      <BehaviorItem
                        key={behavior.Id}
                        behavior={behavior}
                        count={behaviorCounts[behavior.Id] || 0}
                        onCountChange={handleBehaviorCountChange}
                        onToggle={handleBehaviorToggle}
                        disabled={saving}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bad Behaviors */}
              {tab === "bad" && (
                <div>
                  <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    พฤติกรรมไม่ดี ({badBehaviors.length} รายการ)
                  </h2>
                  <div className="space-y-4">
                    {badBehaviors.map((behavior) => (
                      <BehaviorItem
                        key={behavior.Id}
                        behavior={behavior}
                        count={behaviorCounts[behavior.Id] || 0}
                        onCountChange={handleBehaviorCountChange}
                        onToggle={handleBehaviorToggle}
                        disabled={saving}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {tab === "rewards" && (
                <div>
                  <h2 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    รางวัล ({familyRewards.length} รายการ)
                  </h2>
                  <div className="space-y-4">
                    {familyRewards.map((reward) => (
                      <RewardItem
                        key={reward.Id}
                        reward={reward}
                        currentPoints={currentPoints}
                        onRedeem={handleRewardRedeem}
                        disabled={saving}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Save Button */}
        {totalPendingActivities > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={saveActivities}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving
                ? "กำลังบันทึก..."
                : `บันทึกกิจกรรม (${totalPendingActivities})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildInterface;
