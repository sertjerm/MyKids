// src/hooks/useApi.js - Custom Hook for API management

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Generic API hook
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Hook สำหรับดึงข้อมูลเด็กทั้งหมด
export const useChildren = () => {
  return useApi(api.children.getAll);
};

// Hook สำหรับดึงข้อมูลเด็กคนเดียว
export const useChild = (childId) => {
  return useApi(() => api.children.getById(childId), [childId]);
};

// Hook สำหรับดึงคะแนนวันนี้
export const useTodayScore = (childId) => {
  return useApi(() => api.children.getTodayScore(childId), [childId]);
};

// Hook สำหรับดึงพฤติกรรมดี
export const useGoodBehaviors = () => {
  return useApi(api.behaviors.getGood);
};

// Hook สำหรับดึงพฤติกรรมไม่ดี
export const useBadBehaviors = () => {
  return useApi(api.behaviors.getBad);
};

// Hook สำหรับดึงพฤติกรรมทั้งหมด
export const useBehaviors = () => {
  return useApi(api.behaviors.getAll);
};

// Hook สำหรับดึงรางวัล
export const useRewards = () => {
  return useApi(api.rewards.getAll);
};

// Hook สำหรับดึงกิจกรรม
export const useActivities = () => {
  return useApi(api.activities.getAll);
};

// Hook สำหรับดึง Dashboard
export const useDashboard = () => {
  return useApi(api.dashboard.getOverview);
};

// Hook สำหรับจัดการการส่งข้อมูล (POST/PUT/DELETE)
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiFunction, data = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(data);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      console.error('Mutation Error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
};

// Hook สำหรับบันทึกกิจกรรม
export const useRecordActivity = () => {
  const { mutate, loading, error } = useApiMutation();

  const recordActivity = useCallback(async (activityData) => {
    return await mutate(api.activities.record, activityData);
  }, [mutate]);

  const recordMultipleActivities = useCallback(async (activitiesArray) => {
    const results = [];
    
    for (const activity of activitiesArray) {
      const result = await recordActivity(activity);
      results.push(result);
    }
    
    return results;
  }, [recordActivity]);

  return { 
    recordActivity, 
    recordMultipleActivities, 
    loading, 
    error 
  };
};

// Hook สำหรับสร้างเด็กใหม่
export const useCreateChild = () => {
  const { mutate, loading, error } = useApiMutation();

  const createChild = useCallback(async (childData) => {
    return await mutate(api.children.create, childData);
  }, [mutate]);

  return { createChild, loading, error };
};

// Hook สำหรับสร้างพฤติกรรมใหม่
export const useCreateBehavior = () => {
  const { mutate, loading, error } = useApiMutation();

  const createBehavior = useCallback(async (behaviorData) => {
    return await mutate(api.behaviors.create, behaviorData);
  }, [mutate]);

  return { createBehavior, loading, error };
};

// Hook สำหรับสร้างรางวัลใหม่
export const useCreateReward = () => {
  const { mutate, loading, error } = useApiMutation();

  const createReward = useCallback(async (rewardData) => {
    return await mutate(api.rewards.create, rewardData);
  }, [mutate]);

  return { createReward, loading, error };
};

// Hook สำหรับตรวจสอบสถานะ API
export const useApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [statusData, setStatusData] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const result = await api.checkStatus();
      setStatus(result.status);
      setStatusData(result.data);
    } catch (err) {
      setStatus('error');
      setStatusData({ error: err.message });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, statusData, checkStatus };
};

// Hook รวมสำหรับ ChildDashboard
export const useChildDashboardData = (childId = null) => {
  const children = useChildren();
  const goodBehaviors = useGoodBehaviors();
  const badBehaviors = useBadBehaviors();
  const rewards = useRewards();

  const [selectedChild, setSelectedChild] = useState(null);

  // Set selected child when data loads
  useEffect(() => {
    if (children.data && !selectedChild) {
      const child = childId 
        ? children.data.find(c => c.Id === childId)
        : children.data[0];
      
      if (child) {
        setSelectedChild(child);
      }
    }
  }, [children.data, childId, selectedChild]);

  const loading = children.loading || goodBehaviors.loading || badBehaviors.loading || rewards.loading;
  const error = children.error || goodBehaviors.error || badBehaviors.error || rewards.error;

  const refetchAll = () => {
    children.refetch();
    goodBehaviors.refetch();
    badBehaviors.refetch();
    rewards.refetch();
  };

  return {
    children: children.data || [],
    goodBehaviors: goodBehaviors.data || [],
    badBehaviors: badBehaviors.data || [],
    rewards: rewards.data || [],
    selectedChild,
    setSelectedChild,
    loading,
    error,
    refetchAll,
  };
};

// Hook รวมสำหรับ AdminDashboard
export const useAdminDashboardData = () => {
  const dashboard = useDashboard();
  const children = useChildren();
  const behaviors = useBehaviors();
  const rewards = useRewards();
  const activities = useActivities();

  const loading = dashboard.loading || children.loading || behaviors.loading || rewards.loading || activities.loading;
  const error = dashboard.error || children.error || behaviors.error || rewards.error || activities.error;

  const refetchAll = () => {
    dashboard.refetch();
    children.refetch();
    behaviors.refetch();
    rewards.refetch();
    activities.refetch();
  };

  return {
    dashboard: dashboard.data,
    children: children.data || [],
    behaviors: behaviors.data || [],
    rewards: rewards.data || [],
    activities: activities.data || [],
    loading,
    error,
    refetchAll,
  };
};

export default useApi;