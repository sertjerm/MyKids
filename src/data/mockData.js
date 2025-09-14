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
