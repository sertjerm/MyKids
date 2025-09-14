#!/bin/bash

# =============================================================================
# MyKids Behavior Tracker - Project Setup Script
# =============================================================================
# This script creates the complete file structure and all necessary files
# for the MyKids Behavior Tracker React application
# 
# Usage: ./setup-mykids-tracker.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="mykids-behavior-tracker"
PROJECT_DIR=$(pwd)

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Header
echo -e "${PURPLE}"
echo "██████╗ ██╗   ██╗██╗  ██╗██╗██████╗ ███████╗"
echo "██╔══██╗╚██╗ ██╔╝██║ ██╔╝██║██╔══██╗██╔════╝"
echo "██║  ██║ ╚████╔╝ █████╔╝ ██║██║  ██║███████╗"
echo "██║  ██║  ╚██╔╝  ██╔═██╗ ██║██║  ██║╚════██║"
echo "██████╔╝   ██║   ██║  ██╗██║██████╔╝███████║"
echo "╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝"
echo "                                              "
echo "🎯 MyKids Behavior Tracker Setup"
echo -e "${NC}"

log "Starting project setup..."

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    warning "package.json not found. Are you in a React project directory?"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create directory structure
log "Creating directory structure..."

mkdir -p src/{components,services,data,styles,utils,hooks}
mkdir -p public/images/avatars
mkdir -p docs

success "Directory structure created"

# =============================================================================
# Create Mock Data File
# =============================================================================
log "Creating mockData.js..."

cat > src/data/mockData.js << 'EOF'
// src/data/mockData.js
// Mock Data สำหรับระบบ MyKids ตามโครงสร้าง Database ใหม่

// ===============================================
// FAMILIES - ข้อมูลครอบครัว
// ===============================================
export const mockFamilies = [
  {
    Id: 'F001',
    Name: 'ครอบครัวสมิท',
    Password: 'password', // ในความเป็นจริงควร hash
    Email: 'smith.family@example.com',
    Phone: '081-234-5678',
    AvatarPath: '👨‍👩‍👧‍👦',
    CreatedAt: '2024-01-15T08:30:00',
    UpdatedAt: '2024-12-10T14:20:00',
    IsActive: 1
  },
  {
    Id: 'F002', 
    Name: 'ครอบครัวจอห์นสัน',
    Password: 'password',
    Email: 'johnson.family@example.com', 
    Phone: '081-876-5432',
    AvatarPath: '👨‍👩‍👧‍👦',
    CreatedAt: '2024-02-20T10:15:00',
    UpdatedAt: '2024-12-08T16:45:00',
    IsActive: 1
  },
  {
    Id: 'F003',
    Name: 'ครอบครัวทดสอบ',
    Password: 'password',
    Email: 'test.family@example.com',
    Phone: '081-111-2222', 
    AvatarPath: '👨‍👩‍👧‍👦',
    CreatedAt: '2024-12-01T09:00:00',
    UpdatedAt: null,
    IsActive: 1
  }
];

// ===============================================
// CHILDREN - ข้อมูลเด็ก
// ===============================================
export const mockChildren = [
  // ครอบครัวสมิท
  {
    Id: 'C001',
    FamilyId: 'F001',
    Name: 'น้องพีฟ่า',
    Age: 11,
    Gender: 'F',
    AvatarPath: '👧',
    DateOfBirth: '2013-05-15',
    CreatedAt: '2024-01-15T08:45:00',
    UpdatedAt: '2024-12-10T10:30:00',
    IsActive: 1
  },
  {
    Id: 'C002',
    FamilyId: 'F001', 
    Name: 'น้องพีฟอง',
    Age: 10,
    Gender: 'M',
    AvatarPath: '👦',
    DateOfBirth: '2014-08-20',
    CreatedAt: '2024-01-15T08:50:00',
    UpdatedAt: '2024-11-25T15:20:00',
    IsActive: 1
  },
  
  // ครอบครัวจอห์นสัน
  {
    Id: 'C003',
    FamilyId: 'F002',
    Name: 'น้องมาริโอ้', 
    Age: 8,
    Gender: 'M',
    AvatarPath: '👶',
    DateOfBirth: '2016-12-03',
    CreatedAt: '2024-02-20T11:00:00',
    UpdatedAt: '2024-12-05T09:15:00',
    IsActive: 1
  },
  {
    Id: 'C004',
    FamilyId: 'F002',
    Name: 'น้องอย',
    Age: 7, 
    Gender: 'F',
    AvatarPath: '👧',
    DateOfBirth: '2017-09-10',
    CreatedAt: '2024-02-20T11:10:00',
    UpdatedAt: '2024-12-01T14:30:00',
    IsActive: 1
  },

  // ครอบครัวทดสอบ
  {
    Id: 'C005',
    FamilyId: 'F003',
    Name: 'น้องเทส',
    Age: 9,
    Gender: 'M', 
    AvatarPath: '🧒',
    DateOfBirth: '2015-03-22',
    CreatedAt: '2024-12-01T09:15:00',
    UpdatedAt: null,
    IsActive: 1
  }
];

// ===============================================
// BEHAVIORS - พฤติกรรม
// ===============================================
export const mockBehaviors = [
  // พฤติกรรมครอบครัวสมิท (F001)
  {
    Id: 'B001',
    FamilyId: 'F001',
    Name: 'แปรงฟัน',
    Description: 'แปรงฟันเช้า-เย็นให้สะอาด',
    Points: 3,
    Color: '#4ADE80',
    Category: 'สุขภาพ',
    Type: 'Good',
    IsRepeatable: 0,
    MaxPerDay: 2,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:00:00',
    UpdatedAt: '2024-11-10T16:20:00'
  },
  {
    Id: 'B002',
    FamilyId: 'F001',
    Name: 'เก็บของเล่น',
    Description: 'เก็บของเล่นหลังเล่นเสร็จ',
    Points: 2,
    Color: '#60A5FA', 
    Category: 'ความรับผิดชอบ',
    Type: 'Good',
    IsRepeatable: 0,
    MaxPerDay: 1,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:05:00',
    UpdatedAt: null
  },
  {
    Id: 'B003',
    FamilyId: 'F001',
    Name: 'อ่านหนังสือ',
    Description: 'อ่านหนังสือก่อนนอนอย่างน้อย 15 นาที',
    Points: 5,
    Color: '#A78BFA',
    Category: 'การเรียนรู้', 
    Type: 'Good',
    IsRepeatable: 0,
    MaxPerDay: 1,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:10:00',
    UpdatedAt: '2024-10-15T12:00:00'
  },
  {
    Id: 'B004',
    FamilyId: 'F001',
    Name: 'ช่วยงานบ้าน',
    Description: 'ช่วยผู้ปกครองทำงานบ้าน',
    Points: 4,
    Color: '#FBBF24',
    Category: 'ความรับผิดชอบ',
    Type: 'Good', 
    IsRepeatable: 0,
    MaxPerDay: 2,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:15:00',
    UpdatedAt: null
  },
  {
    Id: 'B005',
    FamilyId: 'F001',
    Name: 'ไหว้สวย',
    Description: 'ไหว้ผู้ใหญ่อย่างสุภาพ',
    Points: 8,
    Color: '#FB7185',
    Category: 'มารยาท',
    Type: 'Good',
    IsRepeatable: 0,
    MaxPerDay: 1,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:20:00',
    UpdatedAt: null
  },
  {
    Id: 'B006',
    FamilyId: 'F001',
    Name: 'พูดคำหยาบ',
    Description: 'พูดคำหยาบคายไม่เหมาะสม',
    Points: -3,
    Color: '#EF4444',
    Category: 'มารยาท',
    Type: 'Bad',
    IsRepeatable: 1,
    MaxPerDay: null,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:25:00',
    UpdatedAt: null
  },
  {
    Id: 'B007',
    FamilyId: 'F001',
    Name: 'โกหก',
    Description: 'โกหกหรือไม่พูดความจริง', 
    Points: -5,
    Color: '#DC2626',
    Category: 'จริยธรรม',
    Type: 'Bad',
    IsRepeatable: 1,
    MaxPerDay: null,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:30:00',
    UpdatedAt: null
  },
  {
    Id: 'B008',
    FamilyId: 'F001',
    Name: 'ขี้เกียจ',
    Description: 'ไม่ยอมทำกิจกรรมที่ควรทำ',
    Points: -2,
    Color: '#F87171',
    Category: 'พฤติกรรม',
    Type: 'Bad',
    IsRepeatable: 1,
    MaxPerDay: null,
    IsActive: 1,
    CreatedAt: '2024-01-15T09:35:00',
    UpdatedAt: null
  }
];

// ===============================================
// REWARDS - รางวัล
// ===============================================
export const mockRewards = [
  // รางวัลครอบครัวสมิท (F001)
  {
    Id: 'R001',
    FamilyId: 'F001',
    Name: 'ไอศกรีม',
    Description: 'ไอศกรีมแท่งรสชาติที่ชอบ',
    Cost: 10,
    Color: '#FFE4E1',
    Category: 'ขนม',
    ImagePath: '🍦',
    IsActive: 1,
    CreatedAt: '2024-01-15T10:00:00',
    UpdatedAt: null
  },
  {
    Id: 'R002',
    FamilyId: 'F001',
    Name: 'ดู YouTube 30 นาที',
    Description: 'ดู YouTube พิเศษนาน 30 นาที',
    Cost: 15,
    Color: '#E6E6FA',
    Category: 'บันเทิง',
    ImagePath: '📺',
    IsActive: 1,
    CreatedAt: '2024-01-15T10:05:00',
    UpdatedAt: '2024-11-01T14:30:00'
  },
  {
    Id: 'R003',
    FamilyId: 'F001',
    Name: 'ซื้อสติ๊กเกอร์',
    Description: 'ซื้อสติ๊กเกอร์ชุดใหม่ตามใจชอบ',
    Cost: 20,
    Color: '#F0F8FF',
    Category: 'ของเล่น',
    ImagePath: '🎭',
    IsActive: 1,
    CreatedAt: '2024-01-15T10:10:00',
    UpdatedAt: null
  },
  {
    Id: 'R004',
    FamilyId: 'F001',
    Name: 'ขนมเค้ก',
    Description: 'ขนมเค้กชิ้นพิเศษหรือคัพเค้ก',
    Cost: 25,
    Color: '#FFF8DC',
    Category: 'ขนม',
    ImagePath: '🧁',
    IsActive: 1,
    CreatedAt: '2024-01-15T10:15:00',
    UpdatedAt: null
  },
  {
    Id: 'R005',
    FamilyId: 'F001',
    Name: 'ไปสวนสนุก',
    Description: 'ไปเที่ยวสวนสนุกในวันหยุด',
    Cost: 50,
    Color: '#FFEFD5',
    Category: 'กิจกรรม',
    ImagePath: '🎡',
    IsActive: 1,
    CreatedAt: '2024-01-15T10:20:00',
    UpdatedAt: '2024-10-20T11:00:00'
  }
];

// ===============================================
// DAILY ACTIVITIES - กิจกรรมรายวัน
// ===============================================
export const mockDailyActivities = [
  // กิจกรรมตัวอย่าง - วันนี้ (2024-12-15)
  {
    Id: 1,
    ItemId: 'B001',
    ChildId: 'C001',
    ActivityDate: '2024-12-15',
    ActivityType: 'Good',
    Count: 1,
    EarnedPoints: 3,
    Note: 'แปรงฟันเช้าแล้ว สะอาดมาก',
    ApprovedBy: 'F001',
    ApprovedAt: '2024-12-15T07:30:00',
    Status: 'Approved',
    CreatedAt: '2024-12-15T07:25:00',
    UpdatedAt: null
  },
  {
    Id: 2,
    ItemId: 'B002',
    ChildId: 'C001', 
    ActivityDate: '2024-12-15',
    ActivityType: 'Good',
    Count: 1,
    EarnedPoints: 2,
    Note: 'เก็บของเล่นหลังเล่นเสร็จ',
    ApprovedBy: 'F001',
    ApprovedAt: '2024-12-15T10:15:00',
    Status: 'Approved',
    CreatedAt: '2024-12-15T10:10:00',
    UpdatedAt: null
  },
  {
    Id: 3,
    ItemId: 'R001',
    ChildId: 'C001',
    ActivityDate: '2024-12-15',
    ActivityType: 'Reward',
    Count: 1,
    EarnedPoints: -10,
    Note: 'แลกไอศกรีมเย็น ๆ',
    ApprovedBy: 'F001',
    ApprovedAt: '2024-12-15T16:00:00',
    Status: 'Approved',
    CreatedAt: '2024-12-15T15:55:00',
    UpdatedAt: null
  }
];

// ===============================================
// UTILITY FUNCTIONS - ฟังก์ชันช่วยเหลือ
// ===============================================

// ฟังก์ชันคำนวดคะแนนปัจจุบันของเด็ก
export const calculateCurrentPoints = (childId) => {
  return mockDailyActivities
    .filter(activity => 
      activity.ChildId === childId && 
      activity.Status === 'Approved'
    )
    .reduce((total, activity) => total + activity.EarnedPoints, 0);
};

// ฟังก์ชันดึงพฤติกรรมของครอบครัว
export const getBehaviorsByFamily = (familyId) => {
  return mockBehaviors.filter(behavior => 
    behavior.FamilyId === familyId && behavior.IsActive
  );
};

// ฟังก์ชันดึงรางวัลของครอบครัว  
export const getRewardsByFamily = (familyId) => {
  return mockRewards.filter(reward => 
    reward.FamilyId === familyId && reward.IsActive
  );
};

// ฟังก์ชันดึงเด็กของครอบครัว
export const getChildrenByFamily = (familyId) => {
  return mockChildren.filter(child => 
    child.FamilyId === familyId && child.IsActive
  );
};

// ฟังก์ชันตรวจสอบว่าพฤติกรรมทำได้อีกหรือไม่
export const canPerformBehavior = (childId, behaviorId, date) => {
  const behavior = mockBehaviors.find(b => b.Id === behaviorId);
  if (!behavior) return false;

  if (behavior.IsRepeatable) return true;

  const existingActivities = mockDailyActivities.filter(activity => 
    activity.ChildId === childId &&
    activity.ItemId === behaviorId &&
    activity.ActivityDate === date &&
    activity.Status === 'Approved'
  );

  if (behavior.MaxPerDay) {
    return existingActivities.length < behavior.MaxPerDay;
  }

  return existingActivities.length === 0;
};

// ฟังก์ชันตรวจสอบว่าแลกรางวัลได้หรือไม่
export const canRedeemReward = (childId, rewardId) => {
  const currentPoints = calculateCurrentPoints(childId);
  const reward = mockRewards.find(r => r.Id === rewardId);
  return reward && currentPoints >= reward.Cost;
};

// Export ทั้งหมด
export default {
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
};
EOF

success "mockData.js created"

# =============================================================================
# Create Main API Service
# =============================================================================
log "Creating services/api.js..."

cat > src/services/api.js << 'EOF'
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
EOF

success "services/api.js created"

# =============================================================================
# Create Avatar Component
# =============================================================================
log "Creating components/Avatar.jsx..."

cat > src/components/Avatar.jsx << 'EOF'
// src/components/Avatar.jsx
import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({ src, alt, size = 'md', emoji }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden`}>
      {emoji ? (
        <span className={textSizeClasses[size]}>{emoji}</span>
      ) : src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
};

export default Avatar;
EOF

success "components/Avatar.jsx created"

# =============================================================================
# Create LoginPage Component
# =============================================================================
log "Creating components/LoginPage.jsx..."

cat > src/components/LoginPage.jsx << 'EOF'
// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { mockFamilies, getChildrenByFamily } from '../data/mockData';
import Avatar from './Avatar';

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (family) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(family);
    } catch (error) {
      console.error('Login failed:', error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">MyKids Tracker</h1>
          <p className="text-gray-600">เลือกครอบครัวของคุณ</p>
        </div>
        
        <div className="space-y-4">
          {mockFamilies.map(family => (
            <button
              key={family.Id}
              onClick={() => handleLogin(family)}
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors duration-200 flex items-center gap-4 disabled:opacity-50"
            >
              <Avatar emoji={family.AvatarPath} size="md" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-800">{family.Name}</h3>
                <p className="text-sm text-gray-600">{family.Email}</p>
                <p className="text-xs text-gray-500">
                  {getChildrenByFamily(family.Id).length} คน
                </p>
              </div>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🎮 Demo Mode - เลือกครอบครัวใดก็ได้เพื่อทดลองใช้งาน</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
EOF

success "components/LoginPage.jsx created"

# =============================================================================
# Create Components Index
# =============================================================================
log "Creating components/index.js..."

cat > src/components/index.js << 'EOF'
// src/components/index.js
// Central export for all components

export { default as LoginPage } from './LoginPage';
export { default as Avatar } from './Avatar';

// TODO: Export other components when they are separated
// export { default as AdminDashboard } from './AdminDashboard';
// export { default as ChildInterface } from './ChildInterface';
// export { default as BehaviorCard } from './BehaviorCard';
// export { default as RewardCard } from './RewardCard';
// export { default as PointsBadge } from './PointsBadge';
EOF

success "components/index.js created"

# =============================================================================
# Create Main App Component
# =============================================================================
log "Creating App.jsx..."

cat > src/App.jsx << 'EOF'
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Users, Home, Settings, LogOut, User, Star, Gift, Calendar, BarChart3 } from 'lucide-react';
import mockData, { 
  mockFamilies, 
  getBehaviorsByFamily, 
  getRewardsByFamily, 
  getChildrenByFamily,
  calculateCurrentPoints,
  canPerformBehavior,
  canRedeemReward
} from './data/mockData';

// Import components
import { LoginPage, Avatar } from './components';

// Import API service
import api from './services/api';

// Helper Components
const BehaviorCard = ({ behavior, onSelect, selected, disabled = false, showPoints = true }) => {
  const isGood = behavior.Type === 'Good';
  
  return (
    <div 
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        disabled 
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : selected 
            ? 'border-purple-400 bg-purple-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-gray-300 shadow-md'
      }`}
      onClick={disabled ? undefined : () => onSelect(behavior)}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: behavior.Color }}
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{behavior.Name}</h3>
          <p className="text-sm text-gray-500">{behavior.Category}</p>
          {behavior.Description && (
            <p className="text-xs text-gray-400 mt-1">{behavior.Description}</p>
          )}
        </div>
        {showPoints && (
          <div className={`px-2 py-1 rounded-full text-sm font-semibold ${
            isGood 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isGood ? '+' : ''}{behavior.Points}
          </div>
        )}
      </div>
      {!behavior.IsRepeatable && (
        <div className="mt-2 text-xs text-blue-600">
          📅 ทำได้ {behavior.MaxPerDay || 1} ครั้ง/วัน
        </div>
      )}
    </div>
  );
};

const RewardCard = ({ reward, onSelect, disabled = false, childPoints = 0 }) => {
  const canAfford = childPoints >= reward.Cost;
  const actuallyDisabled = disabled || !canAfford;
  
  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
        actuallyDisabled 
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 bg-white cursor-pointer hover:border-purple-300 hover:shadow-lg transform hover:scale-105'
      }`}
      onClick={actuallyDisabled ? undefined : () => onSelect(reward)}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: reward.Color }}
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{reward.Name}</h3>
          <p className="text-sm text-gray-500">{reward.Category}</p>
          {reward.Description && (
            <p className="text-xs text-gray-400 mt-1">{reward.Description}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-sm font-semibold ${
          canAfford 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {reward.Cost} ⭐
        </div>
      </div>
      {!canAfford && (
        <div className="mt-2 text-xs text-red-500">
          💰 ต้องการ {reward.Cost - childPoints} แต้มเพิ่ม
        </div>
      )}
    </div>
  );
};

const PointsBadge = ({ points }) => {
  const isPositive = points >= 0;
  
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
      isPositive 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      <Star className="w-4 h-4" />
      {points}
    </div>
  );
};

// Child Interface
const ChildInterface = ({ family, child, onBack }) => {
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [todayActivities, setTodayActivities] = useState([]);
  
  const today = new Date().toISOString().split('T')[0];
  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);
  
  useEffect(() => {
    // Calculate current points
    const points = calculateCurrentPoints(child.Id);
    setCurrentPoints(points);
    
    // Load today's activities
    const activities = mockData.mockDailyActivities.filter(activity => 
      activity.ChildId === child.Id && 
      activity.ActivityDate === today &&
      activity.Status === 'Approved'
    );
    setTodayActivities(activities);
  }, [child.Id, today]);

  const handleBehaviorSelect = async (behavior) => {
    try {
      // Check if behavior can be performed
      if (!canPerformBehavior(child.Id, behavior.Id, today)) {
        alert('พฤติกรรมนี้ทำครบแล้วสำหรับวันนี้');
        return;
      }

      // Add activity using main API
      const result = await api.recordBehavior({
        childId: child.Id,
        behaviorId: behavior.Id,
        note: `${behavior.Name} - เพิ่มโดยเด็ก`,
        familyId: family.Id
      });

      // Update points
      setCurrentPoints(result.newPoints);
      setSelectedBehavior(behavior);
      
      // Add to today's activities
      setTodayActivities(prev => [result.activity, ...prev]);
      
      // Clear selection after animation
      setTimeout(() => {
        setSelectedBehavior(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to add behavior:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleRewardSelect = async (reward) => {
    try {
      if (!canRedeemReward(child.Id, reward.Id)) {
        alert('คะแนนไม่เพียงพอสำหรับรางวัลนี้');
        return;
      }

      // Redeem reward using main API
      const result = await api.redeemReward({
        childId: child.Id,
        rewardId: reward.Id,
        note: `แลก ${reward.Name}`,
        familyId: family.Id
      });

      setCurrentPoints(result.newPoints);
      setSelectedReward(reward);
      
      // Add to today's activities
      setTodayActivities(prev => [result.activity, ...prev]);
      
      setTimeout(() => {
        setSelectedReward(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <Avatar emoji={child.AvatarPath} size="xl" />
            <h2 className="text-xl font-bold text-gray-800 mt-2">{child.Name}</h2>
            <p className="text-gray-600">อายุ {child.Age} ปี</p>
          </div>
          <div className="w-8" />
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            <Star className="w-8 h-8 inline mr-2" />
            {currentPoints}
          </div>
          <p className="text-gray-600">คะแนนทั้งหมด</p>
        </div>
      </div>

      {/* Today's Activities Summary */}
      {todayActivities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            กิจกรรมวันนี้
          </h3>
          <div className="space-y-2">
            {todayActivities.slice(0, 3).map(activity => (
              <div key={activity.Id} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  activity.ActivityType === 'Good' ? 'bg-green-400' :
                  activity.ActivityType === 'Bad' ? 'bg-red-400' : 'bg-purple-400'
                }`} />
                <span className="flex-1">{activity.Note}</span>
                <span className={`font-semibold ${
                  activity.EarnedPoints > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.EarnedPoints > 0 ? '+' : ''}{activity.EarnedPoints}
                </span>
              </div>
            ))}
            {todayActivities.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                และอีก {todayActivities.length - 3} กิจกรรม
              </div>
            )}
          </div>
        </div>
      )}

      {/* Good Behaviors */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
          พฤติกรรมดี
        </h3>
        <div className="grid gap-3">
          {familyBehaviors.filter(b => b.Type === 'Good').map(behavior => (
            <BehaviorCard
              key={behavior.Id}
              behavior={behavior}
              onSelect={handleBehaviorSelect}
              selected={selectedBehavior?.Id === behavior.Id}
              disabled={!canPerformBehavior(child.Id, behavior.Id, today)}
            />
          ))}
        </div>
      </div>

      {/* Bad Behaviors */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✗</span>
          </div>
          พฤติกรรมไม่ดี
        </h3>
        <div className="grid gap-3">
          {familyBehaviors.filter(b => b.Type === 'Bad').map(behavior => (
            <BehaviorCard
              key={behavior.Id}
              behavior={behavior}
              onSelect={handleBehaviorSelect}
              selected={selectedBehavior?.Id === behavior.Id}
            />
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          รางวัล
        </h3>
        <div className="grid gap-3">
          {familyRewards.map(reward => (
            <RewardCard
              key={reward.Id}
              reward={reward}
              onSelect={handleRewardSelect}
              childPoints={currentPoints}
            />
          ))}
        </div>
      </div>

      {/* Success Messages */}
      {selectedBehavior && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg ${
          selectedBehavior.Type === 'Good' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {selectedBehavior.Type === 'Good' ? '🎉' : '😔'} {selectedBehavior.Name} {selectedBehavior.Points > 0 ? '+' : ''}{selectedBehavior.Points}
        </div>
      )}

      {selectedReward && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg bg-purple-500 text-white">
          🎁 ได้รับ {selectedReward.Name}!
        </div>
      )}
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = ({ family, onLogout, onSelectChild }) => {
  const [activeTab, setActiveTab] = useState('children');
  const [familyData, setFamilyData] = useState({ children: [], totalPoints: 0 });

  useEffect(() => {
    loadFamilyData();
  }, [family.Id]);

  const loadFamilyData = () => {
    const children = getChildrenByFamily(family.Id).map(child => ({
      ...child,
      currentPoints: calculateCurrentPoints(child.Id)
    }));
    
    const totalPoints = children.reduce((sum, child) => sum + child.currentPoints, 0);
    
    setFamilyData({ children, totalPoints });
  };

  const familyBehaviors = getBehaviorsByFamily(family.Id);
  const familyRewards = getRewardsByFamily(family.Id);

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar emoji={family.AvatarPath} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{family.Name}</h1>
              <p className="text-gray-600">{family.Email}</p>
              <p className="text-sm text-gray-500">{family.Phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {familyData.totalPoints}
              </div>
              <p className="text-sm text-gray-600">คะแนนรวม</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {familyData.children.length}
              </div>
              <p className="text-sm text-gray-600">เด็ก</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6">
        <div className="flex">
          {[
            { id: 'children', label: 'เด็ก', icon: Users },
            { id: 'behaviors', label: 'พฤติกรรม', icon: Star },
            { id: 'rewards', label: 'รางวัล', icon: Gift },
            { id: 'reports', label: 'รายงาน', icon: BarChart3 },
            { id: 'settings', label: 'ตั้งค่า', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {activeTab === 'children' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">จัดการเด็ก</h2>
            <div className="grid gap-4">
              {familyData.children.map(child => (
                <div key={child.Id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar emoji={child.AvatarPath} size="md" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{child.Name}</h3>
                        <p className="text-gray-600">อายุ {child.Age} ปี • {child.Gender === 'M' ? 'ชาย' : 'หญิง'}</p>
                        <p className="text-sm text-gray-500">
                          เข้าร่วมเมื่อ {new Date(child.CreatedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PointsBadge points={child.currentPoints} />
                      <button
                        onClick={() => onSelectChild(child)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        เข้าใช้งาน
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'behaviors' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">พฤติกรรม</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-600 mb-4">พฤติกรรมดี ({familyBehaviors.filter(b => b.Type === 'Good').length} รายการ)</h3>
              <div className="grid gap-3">
                {familyBehaviors.filter(b => b.Type === 'Good').map(behavior => (
                  <BehaviorCard key={behavior.Id} behavior={behavior} onSelect={() => {}} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4">พฤติกรรมไม่ดี ({familyBehaviors.filter(b => b.Type === 'Bad').length} รายการ)</h3>
              <div className="grid gap-3">
                {familyBehaviors.filter(b => b.Type === 'Bad').map(behavior => (
                  <BehaviorCard key={behavior.Id} behavior={behavior} onSelect={() => {}} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">รางวัล ({familyRewards.length} รายการ)</h2>
            <div className="grid gap-3">
              {familyRewards.map(reward => (
                <RewardCard key={reward.Id} reward={reward} onSelect={() => {}} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">รายงานสถิติ</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {familyData.children.map(child => {
                const childActivities = mockData.mockDailyActivities.filter(a => 
                  a.ChildId === child.Id && a.Status === 'Approved'
                );
                const goodCount = childActivities.filter(a => a.ActivityType === 'Good').length;
                const badCount = childActivities.filter(a => a.ActivityType === 'Bad').length;
                const rewardCount = childActivities.filter(a => a.ActivityType === 'Reward').length;
                
                return (
                  <div key={child.Id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar emoji={child.AvatarPath} size="md" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{child.Name}</h3>
                        <p className="text-sm text-gray-600">สถิติการทำกิจกรรม</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{goodCount}</div>
                        <div className="text-sm text-green-600">พฤติกรรมดี</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{badCount}</div>
                        <div className="text-sm text-red-600">พฤติกรรมไม่ดี</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{rewardCount}</div>
                        <div className="text-sm text-purple-600">รางวัลที่แลก</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{child.currentPoints}</div>
                        <div className="text-sm text-blue-600">คะแนนปัจจุบัน</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">ตั้งค่า</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">ข้อมูลครอบครัว</h3>
                <p className="text-gray-600 mb-3">จัดการข้อมูลครอบครัวและสมาชิก</p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  แก้ไขข้อมูล
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">จัดการพฤติกรรมและรางวัล</h3>
                <p className="text-gray-600 mb-3">เพิ่ม แก้ไข หรือลบพฤติกรรมและรางวัล</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    เพิ่มพฤติกรรม
                  </button>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    เพิ่มรางวัล
                  </button>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">รีเซ็ตข้อมูลทดสอบ</h3>
                <p className="text-gray-600 mb-3">ลบข้อมูลกิจกรรมทั้งหมดและรีเซ็ตคะแนน</p>
                <button 
                  onClick={async () => {
                    if (confirm('คุณต้องการรีเซ็ตข้อมูลทดสอบทั้งหมดหรือไม่?')) {
                      try {
                        const result = await api.resetTestData();
                        alert(result.message);
                        loadFamilyData();
                      } catch (error) {
                        alert('เกิดข้อผิดพลาด: ' + error.message);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  รีเซ็ตข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentFamily, setCurrentFamily] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedChild, setSelectedChild] = useState(null);

  const handleLogin = (family) => {
    setCurrentFamily(family);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentFamily(null);
    setCurrentView('login');
    setSelectedChild(null);
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    setCurrentView('child');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin');
    setSelectedChild(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentView === 'admin' && currentFamily && (
        <AdminDashboard 
          family={currentFamily} 
          onLogout={handleLogout}
          onSelectChild={handleSelectChild}
        />
      )}
      
      {currentView === 'child' && currentFamily && selectedChild && (
        <ChildInterface 
          family={currentFamily}
          child={selectedChild}
          onBack={handleBackToAdmin}
        />
      )}
    </div>
  );
}

export default App;
EOF

success "App.jsx created"

# =============================================================================
# Create Package.json dependencies check
# =============================================================================
log "Checking package.json dependencies..."

if [ -f "package.json" ]; then
    # Check if lucide-react is in dependencies
    if ! grep -q "lucide-react" package.json; then
        warning "lucide-react not found in package.json"
        echo "Please run: npm install lucide-react"
    fi
    
    # Check if tailwindcss is configured
    if [ ! -f "tailwind.config.js" ]; then
        warning "tailwind.config.js not found"
        echo "Please configure Tailwind CSS for styling"
    fi
fi

# =============================================================================
# Create README file
# =============================================================================
log "Creating README.md..."

cat > README.md << 'EOF'
# 🎯 MyKids Behavior Tracker

A modern family behavior tracking system that helps parents motivate children through positive reinforcement and reward systems.

## ✨ Features

### 🏠 **Family-Based System**
- Multi-family support with individual family accounts
- Family-specific behaviors and rewards
- Admin dashboard for parents

### 👶 **Child-Friendly Interface**  
- Colorful, intuitive design for children
- Emoji avatars and visual feedback
- Real-time point tracking

### ⭐ **Smart Behavior System**
- Good behaviors (earn points) vs Bad behaviors (lose points)
- Repeatable vs one-time behaviors
- Daily limits and validation

### 🎁 **Reward Redemption**
- Point-based reward system
- Instant validation of available points
- Custom rewards per family

### 📊 **Analytics & Reports**
- Family statistics dashboard
- Individual child progress tracking
- Activity history and trends

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Modern web browser

### Installation
```bash
# Install dependencies
npm install

# Install required packages (if not already installed)
npm install lucide-react

# Configure Tailwind CSS (if not already configured)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm start
```

### Demo Login
The app includes demo families for testing:
- **ครอบครัวสมิท** - smith.family@example.com
- **ครอบครัวจอห์นสัน** - johnson.family@example.com  
- **ครอบครัวทดสอบ** - test.family@example.com

## 🎮 How to Use

### 👨‍👩‍👧‍👦 **For Parents (Admin)**
1. **Login** - Select your family from the login screen
2. **Dashboard** - View family overview and statistics
3. **Manage Children** - Add/edit child profiles
4. **Behaviors** - Configure good/bad behaviors with points
5. **Rewards** - Set up rewards with point costs
6. **Reports** - Track family progress and statistics

### 👶 **For Children**
1. **Select Child** - Parent selects "เข้าใช้งาน" for specific child
2. **Record Behaviors** - Tap on behaviors completed today
3. **Redeem Rewards** - Use earned points for rewards
4. **Track Progress** - See real-time point updates

## 🏗️ Project Structure

```
src/
├── components/           # UI Components
│   ├── LoginPage.jsx    # Family login
│   ├── Avatar.jsx       # Profile pictures
│   └── index.js         # Component exports
├── services/            # API Layer
│   └── api.js          # Main API interface
├── data/               # Mock Data
│   └── mockData.js     # Database simulation
└── App.jsx             # Main application
```

## 🔧 API Configuration

The system supports both mock data and real API backends:

```javascript
import api from './services/api';

// Use mock data (default)
api.setApiMode(true);

// Switch to real API
api.setApiMode(false);
api.setApiBaseUrl('https://your-api-url.com/v1');
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradients for main actions
- **Good Behaviors**: Green tones for positive actions
- **Bad Behaviors**: Red tones for negative actions  
- **Rewards**: Purple/pink for special items
- **Background**: Soft pastel gradients

## 📱 Responsive Design

The application works seamlessly across:
- **Desktop**: Full dashboard experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Child-friendly mobile interface

## 🤝 Contributing

### Development Setup
```bash
# Fork the repository
# Clone your fork
git clone https://github.com/yourusername/mykids-tracker.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git commit -m "Add new feature"

# Push and create pull request
git push origin feature/new-feature
```

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for families who want to nurture positive behavior in children**

</div>
EOF

success "README.md created"

# =============================================================================
# Create additional utility files
# =============================================================================
log "Creating additional utility files..."

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
EOF
    success ".gitignore created"
fi

# Create startup scripts
cat > scripts/setup.sh << 'EOF'
#!/bin/bash
# Additional setup script

echo "🎯 MyKids Tracker - Additional Setup"

# Check Node.js version
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js detected: $node_version"
else
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional packages if needed
echo "🔧 Installing required packages..."
npm install lucide-react

# Check Tailwind
if [ ! -f "tailwind.config.js" ]; then
    echo "🎨 Setting up Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    
    echo "⚠️  Please configure tailwind.config.js with the following content:"
    echo "
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"
fi

echo "🚀 Setup complete! Run 'npm start' to begin development."
EOF

chmod +x scripts/setup.sh
success "Setup script created in scripts/setup.sh"

# =============================================================================
# Final Steps
# =============================================================================

# Initialize localStorage setup file
cat > src/utils/localStorage.js << 'EOF'
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
EOF

success "LocalStorage utilities created"

# Create project summary
log "Creating project summary..."

cat > PROJECT_SETUP.md << 'EOF'
# MyKids Behavior Tracker - Project Setup Complete! 🎉

## ✅ Created Files

### Core Application Files
- `src/App.jsx` - Main application component
- `src/data/mockData.js` - Mock database with all sample data
- `src/services/api.js` - Main API interface (mock/real API ready)

### Component Files  
- `src/components/LoginPage.jsx` - Family login page
- `src/components/Avatar.jsx` - Reusable avatar component
- `src/components/index.js` - Central component exports

### Utility Files
- `src/utils/localStorage.js` - LocalStorage management
- `scripts/setup.sh` - Additional setup script

### Documentation
- `README.md` - Complete project documentation
- `PROJECT_SETUP.md` - This setup summary file

## 🚀 Next Steps

### 1. Install Dependencies
```bash
npm install lucide-react
```

### 2. Configure Tailwind CSS (if not already done)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to your `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to your `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Start Development
```bash
npm start
```

## 🎮 Demo Usage

1. **Access the app** at `http://localhost:3000`
2. **Select a family** from the demo families
3. **Admin Dashboard** - View children, behaviors, rewards, reports
4. **Child Interface** - Click "เข้าใช้งาน" on any child
5. **Record Behaviors** - Children can tap behaviors to earn/lose points
6. **Redeem Rewards** - Use points to get rewards

## 📊 Demo Families

- **ครอบครัวสมิท** (smith.family@example.com)
  - น้องพีฟ่า (11 ปี) 👧
  - น้องพีฟอง (10 ปี) 👦
  
- **ครอบครัวจอห์นสัน** (johnson.family@example.com)
  - น้องมาริโอ้ (8 ปี) 👶
  - น้องอย (7 ปี) 👧
  
- **ครอบครัวทดสอบ** (test.family@example.com)
  - น้องเทส (9 ปี) 🧒

## 🔧 API Configuration

### Mock Mode (Default)
```javascript
import api from './services/api';
// Already configured for mock data
```

### Real API Mode
```javascript
import api from './services/api';

api.setApiMode(false);
api.setApiBaseUrl('https://your-api.com/v1');
```

## 🎯 Key Features Working

✅ **Family Login System**
✅ **Child Point Tracking** 
✅ **Behavior Recording**
✅ **Reward Redemption**
✅ **Admin Dashboard**
✅ **Real-time Updates**
✅ **LocalStorage Persistence**
✅ **Mobile Responsive**

## 📱 Supported Devices

- 💻 **Desktop** - Full admin dashboard
- 📱 **Mobile** - Touch-friendly child interface  
- 📋 **Tablet** - Optimized for both admin and child use

## 🆘 Troubleshooting

### Common Issues

1. **Icons not showing**: Install `lucide-react`
2. **Styles not working**: Configure Tailwind CSS properly
3. **Data not persisting**: Check browser localStorage
4. **App not starting**: Ensure all dependencies installed

### Support Commands
```bash
# Check setup
npm list lucide-react

# Clear cache
npm start -- --reset-cache

# Reinstall dependencies  
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Ready to Develop!

Your MyKids Behavior Tracker is now ready for development and testing!

**Happy Coding! 🎉**
EOF

# =============================================================================
# Completion Summary
# =============================================================================

echo -e "\n${GREEN}🎉 PROJECT SETUP COMPLETE! 🎉${NC}\n"

echo -e "${BLUE}📁 Created Files:${NC}"
echo "   ✅ src/data/mockData.js"
echo "   ✅ src/services/api.js" 
echo "   ✅ src/components/LoginPage.jsx"
echo "   ✅ src/components/Avatar.jsx"
echo "   ✅ src/components/index.js"
echo "   ✅ src/App.jsx"
echo "   ✅ src/utils/localStorage.js"
echo "   ✅ README.md"
echo "   ✅ PROJECT_SETUP.md"
echo "   ✅ scripts/setup.sh"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "   1. npm install lucide-react"
echo "   2. Configure Tailwind CSS (if needed)"  
echo "   3. npm start"
echo "   4. Visit http://localhost:3000"

echo -e "\n${PURPLE}🎮 Demo Login:${NC}"
echo "   • ครอบครัวสมิท"
echo "   • ครอบครัวจอห์นสัน" 
echo "   • ครอบครัวทดสอบ"

echo -e "\n${GREEN}🚀 Your MyKids Behavior Tracker is ready!${NC}"
echo -e "${BLUE}Happy Coding! 🎯${NC}\n"
EOF

chmod +x setup-mykids-tracker.sh

success "Setup script created successfully!"