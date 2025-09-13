// src/hooks/useApi.js - Custom Hooks สำหรับใช้งาน API ใหม่

import { useState, useEffect, useCallback } from 'react';
import api, { API_CONFIG } from '../services/api.js';

// Hook สำหรับตรวจสอบสถานะ API
export const useApiStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Checking API status...');
      const result = await api.utils.checkStatus();
      
      setStatus(result.status);
      setStatusData(result.data);
      
      console.log('✅ API Status checked:', result);
      
    } catch (error) {
      console.error('❌ API Status check failed:', error);
      setStatus('error');
      setStatusData({ error: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto check on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { 
    status, 
    statusData, 
    loading, 
    checkStatus,
    isConnected: status === 'connected',
    isError: status === 'error'
  };
};

// Hook สำหรับโหลดข้อมูล Dashboard
export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Loading dashboard data...');
      
      const [dashboardResponse, children, goodBehaviors, badBehaviors, rewards] = await Promise.all([
        api.dashboard.getSummary(),
        api.children.getAll(),
        api.behaviors.getGood(),
        api.behaviors.getBad(),
        api.rewards.getAll()
      ]);

      const transformedData = {
        dashboard: dashboardResponse,
        children: children.map(api.utils.transformChild),
        goodBehaviors: goodBehaviors.map(api.utils.transformBehavior),
        badBehaviors: badBehaviors.map(api.utils.transformBehavior),
        rewards: rewards.map(api.utils.transformReward),
      };

      setData(transformedData);
      console.log('✅ Dashboard data loaded:', transformedData);

    } catch (err) {
      console.error('❌ Dashboard data loading failed:', err);
      setError(err.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return { 
    data, 
    loading, 
    error, 
    refresh,
    children: data?.children || [],
    goodBehaviors: data?.goodBehaviors || [],
    badBehaviors: data?.badBehaviors || [],
    rewards: data?.rewards || []
  };
};

// Hook สำหรับ Child Dashboard
export const useChildDashboardData = (initialChildId = null) => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [goodBehaviors, setGoodBehaviors] = useState([]);
  const [badBehaviors, setBadBehaviors] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading child dashboard data...');
      
      const [dashboardResponse, childrenResponse, goodBehaviorsResponse, badBehaviorsResponse, rewardsResponse] = await Promise.all([
        api.dashboard.getSummary(),
        api.children.getAll(),
        api.behaviors.getGood(),
        api.behaviors.getBad(),
        api.rewards.getAll()
      ]);

      // Transform data
      const transformedChildren = Array.isArray(childrenResponse)
        ? childrenResponse.map(api.utils.transformChild)
        : dashboardResponse?.children?.map(api.utils.transformChild) || [];

      const transformedGoodBehaviors = goodBehaviorsResponse.map(api.utils.transformBehavior);
      const transformedBadBehaviors = badBehaviorsResponse.map(api.utils.transformBehavior);
      const transformedRewards = rewardsResponse.map(api.utils.transformReward);

      setChildren(transformedChildren);
      setGoodBehaviors(transformedGoodBehaviors);
      setBadBehaviors(transformedBadBehaviors);
      setRewards(transformedRewards);

      // Auto select child
      const targetChild = initialChildId 
        ? transformedChildren.find(c => c.id === initialChildId)
        : transformedChildren[0];
      
      if (targetChild) {
        setSelectedChild(targetChild);
      }

      console.log('✅ Child dashboard data loaded successfully');

    } catch (err) {
      console.error('❌ Child dashboard data loading failed:', err);
      setError(err.message || err);
    } finally {
      setLoading(false);
    }
  }, [initialChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetchAll = useCallback(() => {
    loadData();
  }, [loadData]);

  const selectChild = useCallback((child) => {
    setSelectedChild(child);
  }, []);

  return {
    children,
    selectedChild,
    setSelectedChild: selectChild,
    goodBehaviors,
    badBehaviors,
    rewards,
    loading,
    error,
    refetchAll
  };
};

// Hook สำหรับการสร้างกิจกรรม
export const useCreateActivity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createActivity = useCallback(async (activityData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('💾 Creating activity:', activityData);
      const result = await api.activities.create(activityData);
      console.log('✅ Activity created:', result);
      return result;

    } catch (err) {
      console.error('❌ Activity creation failed:', err);
      setError(err.message || err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMultipleActivities = useCallback(async (activities) => {
    setLoading(true);
    setError(null);

    try {
      console.log('💾 Creating multiple activities:', activities);
      const results = await api.utils.recordMultipleActivities(activities);
      console.log('✅ Multiple activities processed:', results);
      return results;

    } catch (err) {
      console.error('❌ Multiple activities creation failed:', err);
      setError(err.message || err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createActivity, 
    createMultipleActivities,
    loading, 
    error 
  };
};

// Hook สำหรับ Admin operations
export const useAdminOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createChild = useCallback(async (childData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('👶 Creating child:', childData);
      const result = await api.children.create(childData);
      console.log('✅ Child created:', result);
      return result;

    } catch (err) {
      console.error('❌ Child creation failed:', err);
      setError(err.message || err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createChild,
    loading,
    error
  };
};

// Hook สำหรับ real-time data updates
export const useRealTimeData = (interval = 30000) => { // 30 seconds
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  const updateNow = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      updateNow();
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, interval, updateNow]);

  return {
    lastUpdate,
    autoRefresh,
    setAutoRefresh,
    updateNow,
    timeAgo: Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
  };
};

// Hook สำหรับ local storage state
export const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setState(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setValue];
};

// Hook สำหรับ activity statistics
export const useActivityStats = (activities = []) => {
  const stats = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(a => a.activityDate === today);
    
    const goodCount = todayActivities.filter(a => a.activityType === 'Good').length;
    const badCount = todayActivities.filter(a => a.activityType === 'Bad').length;
    const rewardCount = todayActivities.filter(a => a.activityType === 'Reward').length;
    
    const totalPoints = todayActivities.reduce((sum, a) => sum + (a.earnedPoints || 0), 0);

    return {
      today: {
        total: todayActivities.length,
        good: goodCount,
        bad: badCount,
        rewards: rewardCount,
        points: totalPoints
      },
      all: {
        total: activities.length,
        points: activities.reduce((sum, a) => sum + (a.earnedPoints || 0), 0)
      }
    };
  }, [activities]);

  return stats;
};

// Utility hook สำหรับ error handling
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    setError(errorMessage);
    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    error, 
    handleError, 
    clearError,
    hasError: !!error
  };
};

// Combined hook สำหรับ complete dashboard functionality
export const useCompleteDashboard = (userType = 'child', childId = null) => {
  const apiStatus = useApiStatus();
  const errorHandler = useErrorHandler();
  const realTime = useRealTimeData();
  
  const childDashboard = useChildDashboardData(childId);
  const adminDashboard = useDashboardData();
  const activityOperations = useCreateActivity();
  const adminOperations = useAdminOperations();

  const isChild = userType === 'child';
  const isAdmin = userType === 'admin';

  // Auto refresh on real-time updates
  useEffect(() => {
    if (realTime.autoRefresh && realTime.lastUpdate) {
      if (isChild) {
        childDashboard.refetchAll();
      } else if (isAdmin) {
        adminDashboard.refresh();
      }
    }
  }, [realTime.lastUpdate, realTime.autoRefresh, isChild, isAdmin, childDashboard, adminDashboard]);

  return {
    // API Status
    api: apiStatus,
    
    // Data
    data: isChild ? childDashboard : adminDashboard,
    
    // Operations
    operations: {
      ...activityOperations,
      ...adminOperations
    },
    
    // Real-time
    realTime,
    
    // Error handling
    error: errorHandler,
    
    // Utilities
    isReady: apiStatus.isConnected && !childDashboard.loading && !adminDashboard.loading,
    hasData: isChild ? childDashboard.children.length > 0 : adminDashboard.children.length > 0,
  };
};

// Export all hooks
export default {
  useApiStatus,
  useDashboardData,
  useChildDashboardData,
  useCreateActivity,
  useAdminOperations,
  useRealTimeData,
  useLocalStorageState,
  useActivityStats,
  useErrorHandler,
  useCompleteDashboard
};