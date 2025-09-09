// src/services/api.js - Updated for MyKids MySQL API

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sertjerm.com/my-kids-api/api.php';

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = endpoint ? `${API_BASE_URL}?${endpoint}` : API_BASE_URL;
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.message || result.error);
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Children API
export const childrenAPI = {
  // Get all children
  getAll: () => apiCall('children'),
  
  // Get child by ID
  getById: (id) => apiCall(`children=${id}`),
  
  // Get today's score for a child
  getTodayScore: (id) => apiCall(`children=${id}&today-score`),
  
  // Create new child
  create: (data) => apiCall('children', 'POST', data),
  
  // Note: Update and Delete not implemented in current API
  update: (id, data) => {
    console.warn('Update not implemented in current API');
    return Promise.reject(new Error('Update not implemented'));
  },
  
  delete: (id) => {
    console.warn('Delete not implemented in current API');
    return Promise.reject(new Error('Delete not implemented'));
  },
};

// Behaviors API
export const behaviorsAPI = {
  // Get all behaviors
  getAll: () => apiCall('behaviors'),
  
  // Get good behaviors only
  getGood: () => apiCall('good-behaviors'),
  
  // Get bad behaviors only
  getBad: () => apiCall('bad-behaviors'),
  
  // Get behavior by ID
  getById: (id) => apiCall(`behaviors=${id}`),
  
  // Create new behavior
  create: (data) => apiCall('behaviors', 'POST', data),
  
  // Get behavior summary
  getSummary: () => apiCall('behavior-summary'),
  
  // Note: Update and Delete not implemented in current API
  update: (id, data) => {
    console.warn('Update not implemented in current API');
    return Promise.reject(new Error('Update not implemented'));
  },
  
  delete: (id) => {
    console.warn('Delete not implemented in current API');
    return Promise.reject(new Error('Delete not implemented'));
  },
};

// Rewards API
export const rewardsAPI = {
  // Get all rewards
  getAll: () => apiCall('rewards'),
  
  // Get reward by ID
  getById: (id) => apiCall(`rewards=${id}`),
  
  // Create new reward
  create: (data) => apiCall('rewards', 'POST', data),
  
  // Note: Update and Delete not implemented in current API
  update: (id, data) => {
    console.warn('Update not implemented in current API');
    return Promise.reject(new Error('Update not implemented'));
  },
  
  delete: (id) => {
    console.warn('Delete not implemented in current API');
    return Promise.reject(new Error('Delete not implemented'));
  },
};

// Activities API (replaces dailyActivityAPI)
export const activitiesAPI = {
  // Get all activities
  getAll: () => apiCall('activities'),
  
  // Get daily activities
  getDaily: (date = null, childId = null) => {
    let endpoint = 'daily';
    const params = [];
    
    if (date) params.push(`date=${date}`);
    if (childId) params.push(`childId=${childId}`);
    
    if (params.length > 0) {
      endpoint += '&' + params.join('&');
    }
    
    return apiCall(endpoint);
  },
  
  // Record new activity
  record: (data) => apiCall('activities', 'POST', data),
  
  // Create activity (alias for record)
  create: (data) => apiCall('activities', 'POST', data),
  
  // Get today's summary
  getTodaySummary: (date = null, childId = null) => {
    let endpoint = 'today-summary';
    const params = [];
    
    if (date) params.push(`date=${date}`);
    if (childId) params.push(`childId=${childId}`);
    
    if (params.length > 0) {
      endpoint += '&' + params.join('&');
    }
    
    return apiCall(endpoint);
  },
  
  // Note: Update and Delete not implemented for individual activities
  update: (id, data) => {
    console.warn('Update not implemented in current API');
    return Promise.reject(new Error('Update not implemented'));
  },
  
  delete: (id) => {
    console.warn('Delete not implemented in current API');
    return Promise.reject(new Error('Delete not implemented'));
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: () => apiCall('dashboard'),
};

// System API
export const systemAPI = {
  // Health check
  health: () => apiCall('health'),
  
  // Get API information
  info: () => apiCall(''),
};

// Legacy compatibility - keeping old interface
export const dailyActivityAPI = {
  getAll: () => activitiesAPI.getAll(),
  getByDate: (date) => activitiesAPI.getDaily(date),
  getByChild: (childId) => activitiesAPI.getDaily(null, childId),
  create: (data) => activitiesAPI.create(data),
  getDailySummary: (childId, date) => activitiesAPI.getTodaySummary(date, childId),
  
  // Not implemented in new API
  update: (id, data) => activitiesAPI.update(id, data),
  delete: (id) => activitiesAPI.delete(id),
};

// Utility functions
export const apiUtils = {
  // Format activity data for the new API
  formatActivityData: (childId, itemId, activityType, count = 1, note = '') => ({
    ChildId: childId,
    ItemId: itemId,
    ActivityType: activityType,
    Count: count,
    Note: note,
    ActivityDate: new Date().toISOString().split('T')[0], // Today's date
  }),
  
  // Record multiple activities at once
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
      console.error('Error getting child total points:', error);
      return 0;
    }
  },
  
  // Check if child can afford a reward
  canAffordReward: async (childId, rewardCost) => {
    const totalPoints = await apiUtils.getChildTotalPoints(childId);
    return totalPoints >= rewardCost;
  },
};

// API status checker
export const checkApiStatus = async () => {
  try {
    const health = await systemAPI.health();
    return {
      status: 'connected',
      message: 'API is working',
      data: health,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      data: null,
    };
  }
};

// Default export (for backward compatibility)
const api = {
  children: childrenAPI,
  behaviors: behaviorsAPI,
  rewards: rewardsAPI,
  activities: activitiesAPI,
  dashboard: dashboardAPI,
  system: systemAPI,
  utils: apiUtils,
  checkStatus: checkApiStatus,
};

export default api;