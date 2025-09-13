// src/services/api.js
// แก้ไขการบันทึกข้อมูลให้ถูกต้อง - รองรับ EarnedPoints และ ActivityType ตาม Database Schema

import axios from "axios";

// API Configuration - ใช้ Vite environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://sertjerm.com/my-kids-api/api.php";

console.log("🔗 API_BASE_URL:", API_BASE_URL);

// Helper function to make API calls with better error handling
const apiCall = async (endpoint, method = "GET", data = null) => {
  const url = endpoint ? `${API_BASE_URL}?${endpoint}` : API_BASE_URL;

  try {
    console.log(`📤 ${method} ${url}`, data ? { data } : '');

    const response = await axios({
      url,
      method,
      data: method !== "GET" ? data : undefined,
      headers: { "Content-Type": "application/json" },
      timeout: 10000, // 10 วินาที
    });

    console.log(`📥 Response:`, response.data);

    // ตรวจสอบ response format
    if (response.data && response.data.error) {
      throw new Error(response.data.message || response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMsg = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}`;
      throw new Error(errorMsg);
    } else if (error.request) {
      // Request was made but no response
      throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } else {
      // Something else happened
      throw new Error(error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
    }
  }
};

// Health Check API
export const healthAPI = {
  check: () => apiCall("health"),
};

// Children API - ตรงกับ backend endpoints
export const childrenAPI = {
  // ดึงเด็กทั้งหมด
  getAll: () => apiCall("children"),

  // สร้างเด็กใหม่
  create: (data) =>
    apiCall("children", "POST", {
      Name: data.name,
      Age: data.age,
      AvatarPath: data.avatarPath || "👶",
    }),

  // ดึงข้อมูล dashboard (รวมคะแนน)
  getDashboard: () => apiCall("dashboard"),
};

// Behaviors API - ตรงกับ backend endpoints
export const behaviorsAPI = {
  // ดึงพฤติกรรมทั้งหมด
  getAll: () => apiCall("behaviors"),

  // ดึงพฤติกรรมดีเท่านั้น (good-behaviors หรือ tasks)
  getGood: () => apiCall("good-behaviors"),

  // ดึงพฤติกรรมไม่ดีเท่านั้น (bad-behaviors)
  getBad: () => apiCall("bad-behaviors"),
};

// Rewards API
export const rewardsAPI = {
  // ดึงรางวัลทั้งหมด
  getAll: () => apiCall("rewards"),
};

// Activities API - *** แก้ไขใหม่ให้ตรงกับ Database Schema ***
export const activitiesAPI = {
  // ดึงกิจกรรมทั้งหมด
  getAll: () => apiCall("activities"),

  // บันทึกกิจกรรมใหม่ - ปรับให้ตรงกับ Database Schema
  create: (data) => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.childId || !data.itemId) {
      throw new Error("ต้องระบุ childId และ itemId");
    }

    // คำนวณ EarnedPoints จาก Points และ Count
    const earnedPoints = data.earnedPoints || ((data.points || 0) * (data.count || 1));

    const payload = {
      ChildId: data.childId,
      ItemId: data.itemId,
      ActivityType: data.activityType, // 'Good', 'Bad', 'Reward'
      Count: data.count || 1,
      EarnedPoints: earnedPoints, // *** เพิ่มฟิลด์สำคัญนี้ ***
      Note: data.note || "",
      ActivityDate: data.activityDate || new Date().toISOString().split("T")[0],
    };

    console.log("🎯 Creating activity with payload:", payload);
    
    return apiCall("activities", "POST", payload);
  },

  // เพิ่มฟังก์ชันบันทึกกิจกรรมเดียว (alias)
  record: function(data) {
    return this.create(data);
  }
};

// Dashboard API
export const dashboardAPI = {
  // ดึงข้อมูล dashboard
  getSummary: () => apiCall("dashboard"),
};

// API Utils สำหรับงานทั่วไป (ปรับปรุงใหม่)
export const apiUtils = {
  // ตรวจสอบสถานะ API
  checkStatus: async () => {
    try {
      const result = await healthAPI.check();
      return {
        status: "connected",
        data: result,
      };
    } catch (error) {
      return {
        status: "error",
        data: { error: error.message },
      };
    }
  },

  // แปลงข้อมูลจาก API เป็น format ที่ frontend ต้องการ
  transformChild: (child) => ({
    id: child.Id,
    name: child.Name,
    age: child.Age,
    avatar: child.AvatarPath || "👶",
    todayPoints: child.TodayPoints || 0,
    totalPoints: child.TotalPoints || 0,
    earnedPoints: child.EarnedPoints || 0,
    deductedPoints: child.DeductedPoints || 0,
    isActive: child.IsActive,
  }),

  transformBehavior: (behavior) => ({
    id: behavior.Id,
    name: behavior.Name,
    points: behavior.Points,
    type: behavior.Type,
    color: behavior.Color,
    category: behavior.Category,
    isRepeatable: behavior.IsRepeatable,
    isActive: behavior.IsActive,
  }),

  transformReward: (reward) => ({
    id: reward.Id,
    name: reward.Name,
    cost: reward.Cost,
    color: reward.Color,
    category: reward.Category,
    isActive: reward.IsActive,
  }),

  transformActivity: (activity) => ({
    id: activity.Id || `${activity.ChildId}-${activity.ItemId}-${Date.now()}`,
    childId: activity.ChildId,
    childName: activity.ChildName,
    itemId: activity.ItemId,
    itemName: activity.ItemName,
    activityType: activity.ActivityType,
    count: activity.Count,
    earnedPoints: activity.EarnedPoints || 0,
    note: activity.Note,
    activityDate: activity.ActivityDate,
    createdAt: activity.CreatedAt,
  }),

  // ฟังก์ชันจัดรูปแบบข้อมูลกิจกรรม - ใช้งานใน frontend
  formatActivityData: (childId, itemId, activityType, points = 0, count = 1, note = "") => {
    return {
      childId,
      itemId,
      activityType, // 'Good', 'Bad', 'Reward'
      points,
      count,
      note,
      earnedPoints: points * count, // *** คำนวณ EarnedPoints ***
      activityDate: new Date().toISOString().split("T")[0],
    };
  },

  // ฟังก์ชันพิเศษสำหรับสร้างข้อมูลกิจกรรมจากพฤติกรรม
  createActivityFromBehavior: (childId, behavior, count = 1, note = "") => {
    return apiUtils.formatActivityData(
      childId,
      behavior.id,
      behavior.type, // 'Good' หรือ 'Bad'
      behavior.points,
      count,
      note
    );
  },

  // ฟังก์ชันพิเศษสำหรับสร้างข้อมูลกิจกรรมจากรางวัล
  createActivityFromReward: (childId, reward, count = 1, note = "") => {
    return apiUtils.formatActivityData(
      childId,
      reward.id,
      'Reward',
      -Math.abs(reward.cost), // รางวัลเป็นลบเสมอ
      count,
      note
    );
  },

  // บันทึกกิจกรรมหลายรายการ - ใช้งานใน frontend
  recordMultipleActivities: async (activities) => {
    const results = [];
    
    for (const activity of activities) {
      try {
        const result = await activitiesAPI.create(activity);
        results.push({
          success: true,
          data: result,
          activity: activity
        });
      } catch (error) {
        console.error("Failed to record activity:", activity, error);
        results.push({
          success: false,
          error: error.message,
          activity: activity
        });
      }
    }
    
    return results;
  },

  // ช่วยฟังก์ชันสำหรับกำหนดประเภทกิจกรรมจากพฤติกรรม
  getActivityTypeFromBehavior: (behavior) => {
    if (behavior.Type === 'Good') return 'Good';
    if (behavior.Type === 'Bad') return 'Bad';
    return 'Good'; // default fallback
  },

  // ช่วยฟังก์ชันสำหรับกำหนดประเภทกิจกรรมสำหรับรางวัล
  getActivityTypeForReward: () => 'Reward',

  // คำนวณคะแนนจากจำนวนครั้ง
  calculateEarnedPoints: (points, count) => {
    return (points || 0) * (count || 1);
  },

  // *** ฟังก์ชันใหม่สำหรับการ Debug ***
  debugActivity: (activityData) => {
    console.log("🔍 Debug Activity Data:", {
      original: activityData,
      hasChildId: !!activityData.childId,
      hasItemId: !!activityData.itemId,
      hasActivityType: !!activityData.activityType,
      calculatedEarnedPoints: apiUtils.calculateEarnedPoints(activityData.points, activityData.count)
    });
  }
};

// Export ค่า config สำหรับใช้ในที่อื่น
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    HEALTH: "health",
    CHILDREN: "children",
    BEHAVIORS: "behaviors",
    GOOD_BEHAVIORS: "good-behaviors",
    BAD_BEHAVIORS: "bad-behaviors",
    REWARDS: "rewards",
    ACTIVITIES: "activities",
    DASHBOARD: "dashboard",
  },
  ACTIVITY_TYPES: {
    GOOD: 'Good',
    BAD: 'Bad', 
    REWARD: 'Reward'
  }
};

// Export default object รวม
const api = {
  health: healthAPI,
  children: childrenAPI,
  behaviors: behaviorsAPI,
  rewards: rewardsAPI,
  activities: activitiesAPI,
  dashboard: dashboardAPI,
  utils: apiUtils,
};

export default api;