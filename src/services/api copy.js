// src/services/api.js
// Main API Interface for MyKids Behavior Tracker

import mockData, { 
  mockFamilies, 
  mockChildren, 
  mockBehaviors, 
  mockRewards, 
  mockDailyActivities,
  calculateCurrentPoints,
  getBehaviorsByFamily,
  getRewardsByFamily,
  getChildrenByFamily,
  canPerformBehavior,
  canRedeemReward
} from '../data/mockData.js';

// API Configuration
const API_CONFIG = {
  USE_MOCK_DATA: true, // Set to false when connecting to real API
  BASE_URL: 'https://api.mykids-tracker.com/v1', // Real API URL
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Simulate network delay for realistic experience
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Error handling utility
const handleApiError = (error, operation) => {
  console.error(`API Error in ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
};

// ============================================
// AUTHENTICATION APIs
// ============================================

/**
 * Get all available families (for demo login)
 * @returns {Promise<Array>} Array of families
 */
export const getFamilies = async () => {
  try {
    await delay(200);
    
    if (API_CONFIG.USE_MOCK_DATA) {
      return mockFamilies
        .filter(f => f.IsActive === 1)
        .map(family => ({
          ...family,
          childrenCount: getChildrenByFamily(family.Id).length
        }));
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/families`);
    if (!response.ok) throw new Error('Failed to fetch families');
    return await response.json();
    
  } catch (error) {
    handleApiError(error, 'getFamilies');
  }
};

/**
 * Login with family credentials
 * @param {string} email - Family email
 * @param {string} password - Family password
 * @returns {Promise<Object>} Family object with children
 */
export const loginFamily = async (email, password) => {
  try {
    await delay(500);
    
    if (API_CONFIG.USE_MOCK_DATA) {
      const family = mockFamilies.find(f => 
        f.Email === email && 
        f.Password === password && 
        f.IsActive === 1
      );
      
      if (!family) {
        throw new Error('Invalid email or password');
      }
      
      // Get family children
      const children = getChildrenByFamily(family.Id).map(child => ({
        ...child,
        currentPoints: calculateCurrentPoints(child.Id)
      }));
      
      return {
        ...family,
        children
      };
    }
    
    // Real API call would go here
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
    
  } catch (error) {
    handleApiError(error, 'loginFamily');
  }
};

// ============================================
// ACTIVITIES APIs
// ============================================

/**
 * Record a behavior activity
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} Created activity
 */
export const recordBehavior = async (activityData) => {
  try {
    await delay(400);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (API_CONFIG.USE_MOCK_DATA) {
      // Validate if behavior can be performed
      if (!canPerformBehavior(activityData.childId, activityData.behaviorId, today)) {
        throw new Error('This behavior has already been completed for today');
      }
      
      const behavior = mockBehaviors.find(b => b.Id === activityData.behaviorId);
      if (!behavior) throw new Error('Behavior not found');
      
      // Get current activities from localStorage
      const activities = JSON.parse(localStorage.getItem('mykids_activities') || '[]');
      const existingIds = activities.map(a => a.Id).filter(id => typeof id === 'number');
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      
      const newActivity = {
        Id: nextId,
        ItemId: activityData.behaviorId,
        ChildId: activityData.childId,
        ActivityDate: today,
        ActivityType: behavior.Type,
        Count: 1,
        EarnedPoints: behavior.Points,
        Note: activityData.note || `${behavior.Name} - บันทึกโดยเด็ก`,
        ApprovedBy: activityData.familyId || null,
        ApprovedAt: new Date().toISOString(),
        Status: 'Approved',
        CreatedAt: new Date().toISOString(),
        UpdatedAt: null
      };
      
      activities.push(newActivity);
      localStorage.setItem('mykids_activities', JSON.stringify(activities));
      
      return {
        activity: newActivity,
        newPoints: calculateCurrentPoints(activityData.childId),
        behavior
      };
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/activities/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    
    if (!response.ok) throw new Error('Failed to record behavior');
    return await response.json();
    
  } catch (error) {
    handleApiError(error, 'recordBehavior');
  }
};

/**
 * Redeem a reward
 * @param {Object} redeemData - Redeem data
 * @returns {Promise<Object>} Created activity
 */
export const redeemReward = async (redeemData) => {
  try {
    await delay(400);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (API_CONFIG.USE_MOCK_DATA) {
      // Validate if reward can be redeemed
      if (!canRedeemReward(redeemData.childId, redeemData.rewardId)) {
        throw new Error('Insufficient points to redeem this reward');
      }
      
      const reward = mockRewards.find(r => r.Id === redeemData.rewardId);
      if (!reward) throw new Error('Reward not found');
      
      const activities = JSON.parse(localStorage.getItem('mykids_activities') || '[]');
      const existingIds = activities.map(a => a.Id).filter(id => typeof id === 'number');
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      
      const newActivity = {
        Id: nextId,
        ItemId: redeemData.rewardId,
        ChildId: redeemData.childId,
        ActivityDate: today,
        ActivityType: 'Reward',
        Count: 1,
        EarnedPoints: -reward.Cost,
        Note: redeemData.note || `แลก ${reward.Name}`,
        ApprovedBy: redeemData.familyId || null,
        ApprovedAt: new Date().toISOString(),
        Status: 'Approved',
        CreatedAt: new Date().toISOString(),
        UpdatedAt: null
      };
      
      activities.push(newActivity);
      localStorage.setItem('mykids_activities', JSON.stringify(activities));
      
      return {
        activity: newActivity,
        newPoints: calculateCurrentPoints(redeemData.childId),
        reward
      };
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/activities/reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(redeemData)
    });
    
    if (!response.ok) throw new Error('Failed to redeem reward');
    return await response.json();
    
  } catch (error) {
    handleApiError(error, 'redeemReward');
  }
};

// ============================================
// UTILITY APIs
// ============================================

/**
 * Reset all test data (for demo purposes)
 * @returns {Promise<Object>} Success message
 */
export const resetTestData = async () => {
  try {
    await delay(1000);
    
    if (API_CONFIG.USE_MOCK_DATA) {
      localStorage.removeItem('mykids_activities');
      localStorage.setItem('mykids_activities', JSON.stringify([]));
      return { message: 'ข้อมูลทดสอบถูกรีเซ็ตแล้ว!', success: true };
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/reset-test-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to reset test data');
    return await response.json();
    
  } catch (error) {
    handleApiError(error, 'resetTestData');
  }
};

/**
 * Switch between mock and real API
 * @param {boolean} useMock - Use mock data
 */
export const setApiMode = (useMock = true) => {
  API_CONFIG.USE_MOCK_DATA = useMock;
};

/**
 * Set real API base URL
 * @param {string} baseUrl - API base URL
 */
export const setApiBaseUrl = (baseUrl) => {
  API_CONFIG.BASE_URL = baseUrl;
};

// Export configuration for external use
export const getApiConfig = () => ({ ...API_CONFIG });

// ============================================
// DEFAULT EXPORT - Main API Object
// ============================================

const api = {
  // Authentication
  loginFamily,
  getFamilies,
  
  // Activities
  recordBehavior,
  redeemReward,
  
  // Utilities
  resetTestData,
  
  // Configuration
  setApiMode,
  setApiBaseUrl,
  getApiConfig
};

export default api;
