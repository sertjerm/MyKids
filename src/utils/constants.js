
// src/utils/constants.js
export const API_ENDPOINTS = {
  HEALTH: 'health',
  FAMILIES: 'families',
  CHILDREN: 'children',
  BEHAVIORS: 'behaviors', 
  REWARDS: 'rewards',
  ACTIVITIES: 'activities',
  DASHBOARD: 'dashboard'
}

export const BEHAVIOR_TYPES = {
  GOOD: 'Good',
  BAD: 'Bad'
}

export const ACTIVITY_TYPES = {
  GOOD: 'Good',
  BAD: 'Bad', 
  REWARD: 'Reward'
}

export const DEFAULT_COLORS = {
  GOOD_BEHAVIORS: [
    '#4ADE80', '#60A5FA', '#A78BFA', 
    '#FBBF24', '#FB7185', '#34D399'
  ],
  BAD_BEHAVIORS: [
    '#EF4444', '#DC2626', '#F87171',
    '#FCA5A5', '#B91C1C', '#EF4444'
  ],
  REWARDS: [
    '#FFE4E1', '#E6E6FA', '#E0E6FF', '#E0FFFF',
    '#E6FFE6', '#FFF8DC', '#FFEFD5', '#FFEBEE'
  ]
}

export const POINT_RANGES = {
  GOOD_MIN: 1,
  GOOD_MAX: 10,
  BAD_MIN: -10,
  BAD_MAX: -1
}

// src/utils/helpers.js
export const formatDate = (date, locale = 'th-TH') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

export const formatTime = (date, locale = 'th-TH') => {
  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (date, locale = 'th-TH') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  })
}

export const generateAvatarUrl = (name, backgroundColor = null) => {
  const seed = encodeURIComponent(name)
  const backgrounds = [
    'b6e3f4', 'c084fc', 'fde68a', 'a7f3d0', 'fda4af',
    'fb7185', 'f87171', 'fbbf24', 'a78bfa', 'e879f9'
  ]
  const bgColor = backgroundColor || backgrounds[Math.floor(Math.random() * backgrounds.length)]
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bgColor}`
}

export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0]
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/
  return phoneRegex.test(phone)
}

export const formatPoints = (points) => {
  const sign = points >= 0 ? '+' : ''
  return `${sign}${points}`
}

export const getPointsColor = (points) => {
  return points >= 0 ? 'text-green-600' : 'text-red-600'
}

export const getBehaviorTypeLabel = (type) => {
  switch (type) {
    case 'Good':
      return 'พฤติกรรมดี'
    case 'Bad':
      return 'พฤติกรรมไม่ดี'
    default:
      return type
  }
}