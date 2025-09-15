// src/services/api.js
// MyKids API Interface - Real API Only (No MockData)
// Version: 3.1 - Fixed Login with Email/Password

import axios from "axios";

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://sertjerm.com/mykids-api/api.php",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Error handling utility
const handleApiError = (error, operation) => {
  console.error(`API Error in ${operation}:`, error);
  
  // Extract meaningful error message from axios error
  let errorMessage = error.message;
  if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.statusText) {
    errorMessage = error.response.statusText;
  }
  
  throw new Error(`${operation} failed: ${errorMessage}`);
};

// HTTP request utility
const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config = {
      url,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      timeout: API_CONFIG.TIMEOUT,
      data: options.body || undefined,
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error, `makeRequest to ${endpoint}`);
  }
};

// ============================================
// AUTHENTICATION APIs
// ============================================

export const getFamilies = async () => {
  try {
    return await makeRequest("?families");
  } catch (error) {
    handleApiError(error, "getFamilies");
  }
};

export const loginFamily = async (email, password) => {
  try {
    const response = await makeRequest("?auth", {  // ✅ เปลี่ยนจาก ?login เป็น ?auth
      method: "POST",
      body: { email, password },
    });
    
    // ตรวจสอบ response structure และส่งกลับข้อมูลที่จำเป็น
    if (response.success && response.family) {
      // แปลง children data ให้ field names เป็น camelCase
      const children = (response.children || []).map(child => ({
        id: child.Id,
        familyId: child.FamilyId,
        name: child.Name,
        age: parseInt(child.Age),
        gender: child.Gender,
        avatarPath: child.AvatarPath,
        dateOfBirth: child.DateOfBirth,
        currentPoints: parseInt(child.currentPoints || 0),
        isActive: child.IsActive === '1'
      }));

      return {
        id: response.family.id,
        name: response.family.name,
        email: response.family.email,
        phone: response.family.phone,
        avatarPath: response.family.avatarPath,
        children: children,
        token: response.token
      };
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    handleApiError(error, "loginFamily");
  }
};

export const createFamily = async (familyData) => {
  try {
    return await makeRequest("?families", {
      method: "POST",
      body: familyData,
    });
  } catch (error) {
    handleApiError(error, "createFamily");
  }
};

// ============================================
// CHILDREN APIs
// ============================================

export const getChildren = async (familyId = null) => {
  try {
    const endpoint = familyId ? `?children&familyId=${familyId}` : "?children";
    return await makeRequest(endpoint);
  } catch (error) {
    handleApiError(error, "getChildren");
  }
};

export const getChild = async (childId) => {
  try {
    return await makeRequest(`?children=${childId}`);
  } catch (error) {
    handleApiError(error, "getChild");
  }
};

export const createChild = async (childData) => {
  try {
    return await makeRequest("?children", {
      method: "POST",
      body: childData,
    });
  } catch (error) {
    handleApiError(error, "createChild");
  }
};

// ============================================
// BEHAVIORS APIs
// ============================================

export const getBehaviors = async (familyId, type = null) => {
  try {
    let endpoint = `?behaviors&familyId=${familyId}`;
    if (type) endpoint += `&type=${type}`;
    return await makeRequest(endpoint);
  } catch (error) {
    handleApiError(error, "getBehaviors");
  }
};

export const getGoodBehaviors = async (familyId) => {
  try {
    return await makeRequest(`?good-behaviors&familyId=${familyId}`);
  } catch (error) {
    handleApiError(error, "getGoodBehaviors");
  }
};

export const getBadBehaviors = async (familyId) => {
  try {
    return await makeRequest(`?bad-behaviors&familyId=${familyId}`);
  } catch (error) {
    handleApiError(error, "getBadBehaviors");
  }
};

export const createBehavior = async (behaviorData) => {
  try {
    return await makeRequest("?behaviors", {
      method: "POST",
      body: behaviorData,
    });
  } catch (error) {
    handleApiError(error, "createBehavior");
  }
};

// ============================================
// REWARDS APIs
// ============================================

export const getRewards = async (familyId) => {
  try {
    return await makeRequest(`?rewards&familyId=${familyId}`);
  } catch (error) {
    handleApiError(error, "getRewards");
  }
};

export const createReward = async (rewardData) => {
  try {
    return await makeRequest("?rewards", {
      method: "POST",
      body: rewardData,
    });
  } catch (error) {
    handleApiError(error, "createReward");
  }
};

// ============================================
// DAILY ACTIVITIES APIs
// ============================================

export const getDailyActivities = async (
  childId = null,
  date = null,
  familyId = null
) => {
  try {
    const params = new URLSearchParams();
    if (childId) params.append("childId", childId);
    if (date) params.append("date", date);
    if (familyId) params.append("familyId", familyId);
    const endpoint = params.toString()
      ? `?daily-activities&${params.toString()}`
      : "?daily-activities";
    return await makeRequest(endpoint);
  } catch (error) {
    handleApiError(error, "getDailyActivities");
  }
};

export const recordActivity = async (activityData) => {
  try {
    return await makeRequest("?daily-activities", {
      method: "POST",
      body: activityData,
    });
  } catch (error) {
    handleApiError(error, "recordActivity");
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getCurrentPoints = async (childId) => {
  try {
    const child = await getChild(childId);
    return child.currentPoints || 0;
  } catch (error) {
    handleApiError(error, "getCurrentPoints");
  }
};

export const checkCanPerformBehavior = async (
  childId,
  behaviorId,
  date = new Date().toISOString().split("T")[0]
) => {
  try {
    // ถ้า API มี endpoint เฉพาะให้เปลี่ยนตรงนี้
    return true; // หรือ implement logic ตาม API จริง
  } catch (error) {
    handleApiError(error, "checkCanPerformBehavior");
  }
};

export const checkCanRedeemReward = async (childId, rewardId) => {
  try {
    // ถ้า API มี endpoint เฉพาะให้เปลี่ยนตรงนี้
    return true; // หรือ implement logic ตาม API จริง
  } catch (error) {
    handleApiError(error, "checkCanRedeemReward");
  }
};

export const getDashboardData = async (familyId) => {
  try {
    // อาจจะต้องรวม API หลายตัวเข้าด้วยกัน
    const [children, behaviors, rewards, activities] = await Promise.all([
      getChildren(familyId),
      getBehaviors(familyId),
      getRewards(familyId),
      getDailyActivities(null, null, familyId)
    ]);
    
    return {
      children,
      behaviors,
      rewards,
      activities
    };
  } catch (error) {
    handleApiError(error, "getDashboardData");
  }
};

// ============================================
// API CONFIGURATION
// ============================================

export const setApiBaseUrl = (baseUrl) => {
  API_CONFIG.BASE_URL = baseUrl;
};

export const getApiConfig = () => ({
  ...API_CONFIG,
});

// Export all functions
export default {
  getFamilies,
  loginFamily,
  createFamily,
  getChildren,
  getChild,
  createChild,
  getBehaviors,
  getGoodBehaviors,
  getBadBehaviors,
  createBehavior,
  getRewards,
  createReward,
  getDailyActivities,
  recordActivity,
  getCurrentPoints,
  checkCanPerformBehavior,
  checkCanRedeemReward,
  getDashboardData,
  setApiBaseUrl,
  getApiConfig,
};