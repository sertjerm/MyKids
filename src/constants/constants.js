// src/constants/constants.js

// Behavior Categories
export const behaviorCategories = [
  { value: "สุขภาพ", label: "สุขภาพ", color: "#52c41a" },
  { value: "ความรับผิดชอบ", label: "ความรับผิดชอบ", color: "#1890ff" },
  { value: "การเรียน", label: "การเรียน", color: "#722ed1" },
  { value: "มารยาท", label: "มารยาท", color: "#eb2f96" },
  { value: "ความช่วยเหลือ", label: "ความช่วยเหลือ", color: "#13c2c2" },
  { value: "ออกกำลังกาย", label: "ออกกำลังกาย", color: "#fa8c16" },
  { value: "ทำงานบ้าน", label: "ทำงานบ้าน", color: "#a0d911" },
  { value: "การอ่าน", label: "การอ่าน", color: "#fadb14" },
  { value: "การแบ่งปัน", label: "การแบ่งปัน", color: "#f759ab" },
  { value: "อื่นๆ", label: "อื่นๆ", color: "#8c8c8c" },
];

// Reward Categories
export const rewardCategories = [
  { value: "ขนม", label: "ขนม", color: "#ff7875" },
  { value: "ของเล่น", label: "ของเล่น", color: "#40a9ff" },
  { value: "กิจกรรม", label: "กิจกรรม", color: "#73d13d" },
  { value: "เสื้อผ้า", label: "เสื้อผ้า", color: "#b37feb" },
  { value: "หนังสือ", label: "หนังสือ", color: "#ffa940" },
  { value: "อิเล็กทรอนิกส์", label: "อิเล็กทรอนิกส์", color: "#36cfc9" },
  { value: "เงิน", label: "เงิน", color: "#95de64" },
  { value: "ท่องเที่ยว", label: "ท่องเที่ยว", color: "#ffc069" },
  { value: "พิเศษ", label: "พิเศษ", color: "#ff9c6e" },
  { value: "อื่นๆ", label: "อื่นๆ", color: "#d9d9d9" },
];

// Gender Options
export const genderOptions = [
  { value: "M", label: "ชาย", emoji: "👦" },
  { value: "F", label: "หญิง", emoji: "👧" },
];

// Default Avatar by Gender
export const defaultAvatars = {
  M: "👦",
  F: "👧",
  default: "😊"
};

// Behavior Types
export const behaviorTypes = [
  { value: "Good", label: "พฤติกรรมดี", color: "#52c41a" },
  { value: "Bad", label: "พฤติกรรมไม่ดี", color: "#ff4d4f" },
];

// Point Colors by Range
export const pointColors = {
  negative: "#ff4d4f",  // Red for negative points
  low: "#faad14",       // Orange for 1-10 points
  medium: "#52c41a",    // Green for 11-50 points
  high: "#1890ff",      // Blue for 51+ points
};

// Status Colors
export const statusColors = {
  active: "#52c41a",
  inactive: "#d9d9d9",
  pending: "#faad14",
  approved: "#52c41a",
  rejected: "#ff4d4f",
};

// Age Groups
export const ageGroups = [
  { value: "3-5", label: "3-5 ปี (อนุบาล)", color: "#ffa39e" },
  { value: "6-8", label: "6-8 ปี (ประถม ต้น)", color: "#ffb37c" },
  { value: "9-12", label: "9-12 ปี (ประถม ปลาย)", color: "#fff566" },
  { value: "13-15", label: "13-15 ปี (มัธยม ต้น)", color: "#95de64" },
  { value: "16-18", label: "16-18 ปี (มัธยม ปลาย)", color: "#5cdbd3" },
];

// Activity Types
export const activityTypes = [
  "Behavior",
  "Reward",
  "Bonus",
  "Penalty"
];

// Max Values
export const maxValues = {
  points: 100,
  cost: 1000,
  age: 18,
  childrenPerFamily: 10,
  behaviorsPerFamily: 50,
  rewardsPerFamily: 30,
};

// Default Values
export const defaultValues = {
  behavior: {
    points: 1,
    color: "#52c41a",
    isRepeatable: true,
    type: "Good"
  },
  reward: {
    cost: 10,
    color: "#1890ff",
  },
  child: {
    age: 8,
    gender: "M",
    avatarPath: "👦"
  }
};

// Pastel Rainbow Colors for Kids Theme
export const pastelColors = [
  "#FFE4E1", // Misty Rose
  "#FFE4B5", // Moccasin
  "#E0FFFF", // Light Cyan
  "#F0FFF0", // Honeydew
  "#E6E6FA", // Lavender
  "#FFF0F5", // Lavender Blush
  "#F5FFFA", // Mint Cream
  "#FDF5E6", // Old Lace
  "#F0F8FF", // Alice Blue
  "#F5F5DC", // Beige
  "#FFE4CC", // Peach
  "#E1F5FE", // Light Blue
  "#F3E5F5", // Light Purple
  "#E8F5E8", // Light Green
  "#FFF3E0", // Light Orange
];

// API Endpoints (for reference)
export const apiEndpoints = {
  base: "/backend/api.php",
  health: "?health",
  children: "?children",
  behaviors: "?behaviors",
  rewards: "?rewards",
  activities: "?activities",
  dashboard: "?dashboard",
};

// Error Messages
export const errorMessages = {
  networkError: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
  validationError: "กรุณากรอกข้อมูลให้ครบถ้วน",
  notFound: "ไม่พบข้อมูลที่ต้องการ",
  unauthorized: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
  serverError: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
  duplicateError: "ข้อมูลซ้ำ กรุณาตรวจสอบอีกครั้ง",
  deleteError: "ไม่สามารถลบข้อมูลได้",
  updateError: "ไม่สามารถแก้ไขข้อมูลได้",
  createError: "ไม่สามารถสร้างข้อมูลใหม่ได้",
};

// Success Messages
export const successMessages = {
  created: "สร้างข้อมูลสำเร็จ!",
  updated: "แก้ไขข้อมูลสำเร็จ!",
  deleted: "ลบข้อมูลสำเร็จ!",
  saved: "บันทึกข้อมูลสำเร็จ!",
  approved: "อนุมัติสำเร็จ!",
  rejected: "ปฏิเสธสำเร็จ!",
};

// Date Formats
export const dateFormats = {
  display: "DD/MM/YYYY",
  displayWithTime: "DD/MM/YYYY HH:mm",
  api: "YYYY-MM-DD",
  apiWithTime: "YYYY-MM-DD HH:mm:ss",
};

// Local Storage Keys
export const localStorageKeys = {
  selectedChild: "mykids_selected_child",
  theme: "mykids_theme",
  language: "mykids_language",
  lastFamily: "mykids_last_family",
};

export default {
  behaviorCategories,
  rewardCategories,
  genderOptions,
  defaultAvatars,
  behaviorTypes,
  pointColors,
  statusColors,
  ageGroups,
  activityTypes,
  maxValues,
  defaultValues,
  pastelColors,
  apiEndpoints,
  errorMessages,
  successMessages,
  dateFormats,
  localStorageKeys,
};