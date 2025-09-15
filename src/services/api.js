// src/services/api.js
// MyKids API Interface - Real API Only (No MockData)
// Version: 3.0 - Full Family System Support

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
  throw new Error(`${operation} failed: ${error.message || error}`);
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
    return await makeRequest("?login", {
      method: "POST",
      body: { email, password },
    });
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
    return await makeRequest(`?children&childId=${childId}`);
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
  return await getBehaviors(familyId, "Good");
};

export const getBadBehaviors = async (familyId) => {
  return await getBehaviors(familyId, "Bad");
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
      ? `?activities&${params.toString()}`
      : "?activities";
    return await makeRequest(endpoint);
  } catch (error) {
    handleApiError(error, "getDailyActivities");
  }
};

export const recordActivity = async (activityData) => {
  try {
    return await makeRequest("?activities", {
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
    return await makeRequest(`?dashboard&familyId=${familyId}`);
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
