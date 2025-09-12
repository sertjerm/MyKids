// src/hooks/useApi.js - Custom Hooks for MyKids API

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Generic API hook สำหรับเรียกข้อมูล
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching data...');
      
      const result = await apiFunction();
      
      console.log('✅ Data fetched successfully:', result);
      setData(result);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message);
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

// Generic mutation hook สำหรับสร้าง/แก้ไขข้อมูล
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiFunction, data) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Mutating data...', data);
      
      const result = await apiFunction(data);
      
      console.log('✅ Mutation successful:', result);
      return result;
    } catch (err) {
      console.error('❌ Mutation Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
};

// Hook สำหรับตรวจสอบสถานะ API
export const useApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [statusData, setStatusData] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking API status...');
      const result = await api.utils.checkStatus();
      setStatus(result.status);
      setStatusData(result.data);
      console.log('📊 API Status:', result.status);
    } catch (err) {
      console.error('❌ Status Check Error:', err);
      setStatus('error');
      setStatusData({ error: err.message });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    // ตรวจสอบสถานะทุก 30 วินาที
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, statusData, checkStatus };
};

// Hook สำหรับดึงข้อมูลเด็กทั้งหมด
export const useChildren = () => {
  const { data, loading, error, refetch } = useApi(api.children.getAll);
  
  // แปลงข้อมูลให้เป็น format ที่ frontend ใช้
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

// Hook สำหรับสร้างเด็กใหม่
export const useCreateChild = () => {
  const { mutate, loading, error } = useApiMutation();

  const createChild = useCallback(async (childData) => {
    return await mutate(api.children.create, childData);
  }, [mutate]);

  return { createChild, loading, error };
};

// Hook สำหรับบันทึกกิจกรรม
export const useCreateActivity = () => {
  const { mutate, loading, error } = useApiMutation();

  const createActivity = useCallback(async (activityData) => {
    return await mutate(api.activities.create, activityData);
  }, [mutate]);

  return { createActivity, loading, error };
};

// Hook รวมสำหรับ ChildDashboard
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
        ? children.find(c => c.id === childId) || children[0]
        : children[0];
      setSelectedChild(child);
    }
  }, [children, childId, selectedChild]);

  const loading = childrenLoading || goodLoading || badLoading || rewardsLoading;
  const error = childrenError || goodError || badError || rewardsError;

  const refetchAll = () => {
    refetchChildren();
    refetchGood();
    refetchBad();
    refetchRewards();
  };

  return {
    children,
    selectedChild,
    setSelectedChild,
    goodBehaviors,
    badBehaviors,
    rewards,
    loading,
    error,
    refetchAll
  };
};

// Hook รวมสำหรับ AdminDashboard
export const useAdminDashboardData = () => {
  const { dashboardData, loading: dashLoading, error: dashError, refetch: refetchDash } = useDashboard();
  const { goodBehaviors, loading: goodLoading, error: goodError, refetch: refetchGood } = useGoodBehaviors();
  const { badBehaviors, loading: badLoading, error: badError, refetch: refetchBad } = useBadBehaviors();
  const { rewards, loading: rewardsLoading, error: rewardsError, refetch: refetchRewards } = useRewards();

  const loading = dashLoading || goodLoading || badLoading || rewardsLoading;
  const error = dashError || goodError || badError || rewardsError;

  const refetchAll = () => {
    refetchDash();
    refetchGood();
    refetchBad();
    refetchRewards();
  };

  // สรุปสถิติ
  const stats = {
    totalChildren: dashboardData?.totalChildren || 0,
    goodBehaviors: goodBehaviors.length,
    badBehaviors: badBehaviors.length,
    totalRewards: rewards.length
  };

  return {
    dashboardData,
    goodBehaviors,
    badBehaviors,
    rewards,
    stats,
    loading,
    error,
    refetchAll
  };
};