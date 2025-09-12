// src/services/api.js - Fixed version for MyKids API

// API Configuration - แก้ไขให้ใช้ import.meta.env สำหรับ Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://sertjerm.com/my-kids-api/api.php";

console.log('API_BASE_URL:', API_BASE_URL); // Debug log

// Helper function to make API calls with better error handling
const apiCall = async (endpoint, method = "GET", data = null) => {
  const url = endpoint ? `${API_BASE_URL}?${endpoint}` : API_BASE_URL;

  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    mode: 'cors', // Explicitly set CORS mode
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`API Call: ${method} ${url}`, data ? { data } : ''); // Debug log
    
    const response = await fetch(url, options);

    console.log(`API Response: ${response.status} ${response.statusText}`); // Debug log

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON, got: ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const result = await response.json();
    console.log('API Result:', result); // Debug log

    if (result.error) {
      throw new Error(result.message || result.error);
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    console.error("URL:", url);
    console.error("Options:", options);
    throw error;
  }
};

// Children API
export const childrenAPI = {
  // Get all children
  getAll: () => apiCall("children"),

  // Get child by ID
  getById: (id) => apiCall(`children&id=${id}`),

  // Get today's score for a child
  getTodayScore: (id) => apiCall(`children&id=${id}&today-score`),

  // Create new child
  create: (data) => apiCall("children", "POST", data),

  // Update child (if supported)
  update: (id, data) => apiCall("children", "PUT", { id, ...data }),

  // Delete child (if supported)
  delete: (id) => apiCall("children", "DELETE", { id }),
};

// Behaviors API
export const behaviorsAPI = {
  // Get all behaviors
  getAll: () => apiCall("behaviors"),

  // Get good behaviors only
  getGood: () => apiCall("good-behaviors"),

  // Get bad behaviors only
  getBad: () => apiCall("bad-behaviors"),

  // Get behavior by ID
  getById: (id) => apiCall(`behaviors&id=${id}`),

  // Create new behavior
  create: (data) => apiCall("behaviors", "POST", data),

  // Get behavior summary
  getSummary: () => apiCall("behavior-summary"),

  // Update behavior (if supported)
  update: (id, data) => apiCall("behaviors", "PUT", { id, ...data }),

  // Delete behavior (if supported)
  delete: (id) => apiCall("behaviors", "DELETE", { id }),
};

// Rewards API
export const rewardsAPI = {
  // Get all rewards
  getAll: () => apiCall("rewards"),

  // Get reward by ID
  getById: (id) => apiCall(`rewards&id=${id}`),

  // Create new reward
  create: (data) => apiCall("rewards", "POST", data),

  // Update reward (if supported)
  update: (id, data) => apiCall("rewards", "PUT", { id, ...data }),

  // Delete reward (if supported)
  delete: (id) => apiCall("rewards", "DELETE", { id }),
};

// Activities API
export const activitiesAPI = {
  // Get all activities
  getAll: () => apiCall("activities"),

  // Get daily activities
  getDaily: (date = null, childId = null) => {
    let endpoint = "daily";
    const params = [];

    if (date) params.push(`date=${date}`);
    if (childId) params.push(`childId=${childId}`);

    if (params.length > 0) {
      endpoint += "&" + params.join("&");
    }

    return apiCall(endpoint);
  },

  // Record new activity
  record: (data) => apiCall("activities", "POST", data),

  // Create activity (alias for record)
  create: (data) => apiCall("activities", "POST", data),

  // Get today's summary
  getTodaySummary: (date = null, childId = null) => {
    let endpoint = "today-summary";
    const params = [];

    if (date) params.push(`date=${date}`);
    if (childId) params.push(`childId=${childId}`);

    if (params.length > 0) {
      endpoint += "&" + params.join("&");
    }

    return apiCall(endpoint);
  },

  // Update activity (if supported)
  update: (id, data) => apiCall("activities", "PUT", { id, ...data }),

  // Delete activity (if supported)
  delete: (id) => apiCall("activities", "DELETE", { id }),
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: () => apiCall("dashboard"),
};

// System API
export const systemAPI = {
  // Health check
  health: () => apiCall("health"),

  // Get API information
  info: () => apiCall(""),
};

// Legacy compatibility
export const dailyActivityAPI = {
  getAll: () => activitiesAPI.getAll(),
  getByDate: (date) => activitiesAPI.getDaily(date),
  getByChild: (childId) => activitiesAPI.getDaily(null, childId),
  create: (data) => activitiesAPI.create(data),
  getDailySummary: (childId, date) => activitiesAPI.getTodaySummary(date, childId),
  update: (id, data) => activitiesAPI.update(id, data),
  delete: (id) => activitiesAPI.delete(id),
};

// Utility functions
export const apiUtils = {
  // Format activity data
  formatActivityData: (childId, itemId, activityType, count = 1, note = "") => ({
    ChildId: childId,
    ItemId: itemId,
    ActivityType: activityType,
    Count: count,
    Note: note,
    ActivityDate: new Date().toISOString().split("T")[0],
  }),

  // Record multiple activities
  recordMultipleActivities: async (activities) => {
    const results = [];
    for (const activity of activities) {
      try {
        const result = await activitiesAPI.record(activity);
        results.push({ success: true, result, activity });
      } catch (error) {
        results.push({ success: false, error: error.message, activity });
      }
    }
    return results;
  },

  // Get child's current total points
  getChildTotalPoints: async (childId) => {
    try {
      const child = await childrenAPI.getById(childId);
      return child.TotalPoints || 0;
    } catch (error) {
      console.error("Error getting child total points:", error);
      return 0;
    }
  },

  // Check if child can afford a reward
  canAffordReward: async (childId, rewardCost) => {
    const totalPoints = await apiUtils.getChildTotalPoints(childId);
    return totalPoints >= rewardCost;
  },
};

// API status checker with detailed error reporting
export const checkApiStatus = async () => {
  try {
    const health = await systemAPI.health();
    return {
      status: "connected",
      message: "API is working",
      data: health,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      data: null,
      url: API_BASE_URL,
      timestamp: new Date().toISOString(),
    };
  }
};

// Default export
const api = {
  children: childrenAPI,
  behaviors: behaviorsAPI,
  rewards: rewardsAPI,
  activities: activitiesAPI,
  dashboard: dashboardAPI,
  system: systemAPI,
  utils: apiUtils,
  checkStatus: checkApiStatus,
  baseUrl: API_BASE_URL, // Export base URL for debugging
};

export default api;