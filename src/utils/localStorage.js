// src/utils/localStorage.js
// LocalStorage initialization utilities

import { mockDailyActivities } from '../data/mockData';

export const initializeLocalStorage = () => {
  // Initialize activities if not exists
  if (!localStorage.getItem('mykids_activities')) {
    localStorage.setItem('mykids_activities', JSON.stringify(mockDailyActivities));
  }
  
  console.log('✅ LocalStorage initialized');
};

export const clearLocalStorage = () => {
  localStorage.removeItem('mykids_activities');
  console.log('🗑️ LocalStorage cleared');
};

export const getStorageInfo = () => {
  const activities = JSON.parse(localStorage.getItem('mykids_activities') || '[]');
  return {
    activities: activities.length,
    storage: localStorage.length,
    keys: Object.keys(localStorage)
  };
};
