// src/hooks/useApi.js
// แก้ไขให้รองรับการบันทึกข้อมูล - เพิ่ม Mutation Hooks และ Activity Recording Hooks

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// Custom hook สำหรับ localStorage
export const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setValue];
};

// Base API hook สำหรับ GET requests
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
      console.error("API Error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// *** Hook ใหม่สำหรับ POST/PUT/DELETE requests ***
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiFunction, data) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Mutation starting:", { apiFunction: apiFunction.name, data });
      
      // Debug ข้อมูลก่อนส่ง
      if (data) {
        api.utils.debugActivity && api.utils.debugActivity(data);
      }

      const result = await apiFunction(data);
      
      console.log("✅ Mutation success:", result);
      
      return result;
    } catch (err) {
      console.error("❌ Mutation error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      throw err; // Re-throw เพื่อให้ component จัดการได้
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
};

// API Status hook
export const useApiStatus = () => {
  const [status, setStatus] = useState("checking");
  const [statusData, setStatusData] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      setStatus("checking");
      const result = await api.utils.checkStatus();
      setStatus(result.status);
      setStatusData(result.data);
    } catch (error) {
      setStatus("error");
      setStatusData({ error: error.message });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // ตรวจสอบทุก 30 วินาที
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    status,
    statusData,
    checkStatus,
    isConnected: status === "connected",
    isError: status === "error",
  };
};

// Hook สำหรับดึงข้อมูลเด็กทั้งหมด
export const useChildren = () => {
  const { data, loading, error, refetch } = useApi(api.children.getAll);
  
  const transformedData = data ? data.map(api.utils.transformChild) : [];
  
  return { 
    children: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// Hook สำหรับดึงข้อมูล dashboard
export const useDashboard = () => {
  const { data, loading, error, refetch } = useApi(api.dashboard.getSummary);
  
  // แปลงข้อมูล dashboard
  const transformedData = data ? {
    children: data.children ? data.children.map(api.utils.transformChild) : [],
    totalChildren: data.total_children || 0,
    date: data.date,
    database: data.database
  } : null;
  
  return { 
    dashboardData: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// Hook สำหรับดึงพฤติกรรมดี
export const useGoodBehaviors = () => {
  const { data, loading, error, refetch } = useApi(api.behaviors.getGood);
  
  const transformedData = data ? data.map(api.utils.transformBehavior) : [];
  
  return { 
    goodBehaviors: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// Hook สำหรับดึงพฤติกรรมไม่ดี
export const useBadBehaviors = () => {
  const { data, loading, error, refetch } = useApi(api.behaviors.getBad);
  
  const transformedData = data ? data.map(api.utils.transformBehavior) : [];
  
  return { 
    badBehaviors: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// Hook สำหรับดึงรางวัลทั้งหมด
export const useRewards = () => {
  const { data, loading, error, refetch } = useApi(api.rewards.getAll);
  
  const transformedData = data ? data.map(api.utils.transformReward) : [];
  
  return { 
    rewards: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// Hook สำหรับดึงกิจกรรมทั้งหมด
export const useActivities = () => {
  const { data, loading, error, refetch } = useApi(api.activities.getAll);
  
  const transformedData = data ? data.map(api.utils.transformActivity) : [];
  
  return { 
    activities: transformedData, 
    loading, 
    error, 
    refetch 
  };
};

// *** Hook สำหรับสร้างเด็กใหม่ ***
export const useCreateChild = () => {
  const { mutate, loading, error, reset } = useApiMutation();

  const createChild = useCallback(async (childData) => {
    return await mutate(api.children.create, childData);
  }, [mutate]);

  return { createChild, loading, error, reset };
};

// *** Hook สำหรับบันทึกกิจกรรม - แก้ไขใหม่ ***
export const useCreateActivity = () => {
  const { mutate, loading, error, reset } = useApiMutation();

  const createActivity = useCallback(async (activityData) => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!activityData.childId) {
      throw new Error("ต้องระบุ childId");
    }
    if (!activityData.itemId) {
      throw new Error("ต้องระบุ itemId");
    }
    if (!activityData.activityType) {
      throw new Error("ต้องระบุ activityType");
    }

    console.log("🎯 Creating activity with data:", activityData);
    
    return await mutate(api.activities.create, activityData);
  }, [mutate]);

  return { createActivity, loading, error, reset };
};

// *** Hook ใหม่สำหรับบันทึกกิจกรรมจากพฤติกรรม ***
export const useRecordBehavior = () => {
  const { createActivity, loading, error, reset } = useCreateActivity();

  const recordBehavior = useCallback(async (childId, behavior, count = 1, note = "") => {
    if (!childId || !behavior) {
      throw new Error("ต้องระบุ childId และ behavior");
    }

    const activityData = api.utils.createActivityFromBehavior(childId, behavior, count, note);
    
    console.log("📝 Recording behavior:", { childId, behavior: behavior.name, count, note });
    
    return await createActivity(activityData);
  }, [createActivity]);

  return { recordBehavior, loading, error, reset };
};

// *** Hook ใหม่สำหรับบันทึกกิจกรรมจากรางวัล ***
export const useRecordReward = () => {
  const { createActivity, loading, error, reset } = useCreateActivity();

  const recordReward = useCallback(async (childId, reward, count = 1, note = "") => {
    if (!childId || !reward) {
      throw new Error("ต้องระบุ childId และ reward");
    }

    const activityData = api.utils.createActivityFromReward(childId, reward, count, note);
    
    console.log("🎁 Recording reward:", { childId, reward: reward.name, count, note });
    
    return await createActivity(activityData);
  }, [createActivity]);

  return { recordReward, loading, error, reset };
};

// *** Hook ใหม่สำหรับบันทึกกิจกรรมหลายรายการ ***
export const useRecordMultipleActivities = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordMultiple = useCallback(async (activities) => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Recording multiple activities:", activities.length);
      
      const results = await api.utils.recordMultipleActivities(activities);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`✅ Multiple activities result: ${successCount} success, ${failCount} failed`);
      
      if (failCount > 0) {
        const errors = results.filter(r => !r.success).map(r => r.error).join(", ");
        throw new Error(`บันทึกไม่สำเร็จ ${failCount} รายการ: ${errors}`);
      }
      
      return results;
    } catch (err) {
      console.error("❌ Multiple activities error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { recordMultiple, loading, error, reset };
};

// Hook รวมสำหรับ ChildDashboard - ปรับปรุงใหม่
export const useChildDashboardData = (childId = null) => {
  const { children, loading: childrenLoading, error: childrenError, refetch: refetchChildren } = useChildren();
  const { goodBehaviors, loading: goodLoading, error: goodError, refetch: refetchGood } = useGoodBehaviors();
  const { badBehaviors, loading: badLoading, error: badError, refetch: refetchBad } = useBadBehaviors();
  const { rewards, loading: rewardsLoading, error: rewardsError, refetch: refetchRewards } = useRewards();

  const [selectedChild, setSelectedChild] = useState(null);

  // เลือกเด็กเมื่อข้อมูลโหลดเสร็จ
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      const child = childId 
        ? children.find(c => c.id === childId) 
        : children[0];
      setSelectedChild(child);
    }
  }, [children, childId, selectedChild]);

  const loading = childrenLoading || goodLoading || badLoading || rewardsLoading;
  const error = childrenError || goodError || badError || rewardsError;

  const refetchAll = useCallback(() => {
    refetchChildren();
    refetchGood();
    refetchBad();
    refetchRewards();
  }, [refetchChildren, refetchGood, refetchBad, refetchRewards]);

  return {
    children,
    goodBehaviors,
    badBehaviors,
    rewards,
    selectedChild,
    setSelectedChild,
    loading,
    error,
    refetchAll,
  };
};

// *** Hook ใหม่สำหรับจัดการสถานะการบันทึก ***
export const useActivityRecorder = (onSuccess, onError) => {
  const { recordBehavior, loading: behaviorLoading, error: behaviorError, reset: resetBehavior } = useRecordBehavior();
  const { recordReward, loading: rewardLoading, error: rewardError, reset: resetReward } = useRecordReward();

  const [lastActivity, setLastActivity] = useState(null);

  const recordActivity = useCallback(async (childId, item, type, count = 1, note = "") => {
    try {
      let result;
      
      if (type === 'behavior') {
        result = await recordBehavior(childId, item, count, note);
      } else if (type === 'reward') {
        result = await recordReward(childId, item, count, note);
      } else {
        throw new Error("ประเภทกิจกรรมไม่ถูกต้อง");
      }

      setLastActivity({ childId, item, type, count, note, result, timestamp: Date.now() });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Record activity failed:", error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [recordBehavior, recordReward, onSuccess, onError]);

  const reset = useCallback(() => {
    resetBehavior();
    resetReward();
    setLastActivity(null);
  }, [resetBehavior, resetReward]);

  return {
    recordActivity,
    loading: behaviorLoading || rewardLoading,
    error: behaviorError || rewardError,
    lastActivity,
    reset,
  };
};