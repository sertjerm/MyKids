# 🌈 MyKids - ระบบติดตามพฤติกรรมเด็ก

แอพพลิเคชันสำหรับติดตามพฤติกรรม การให้รางวัล และสร้างแรงจูงใจให้เด็กๆ ด้วย Pastel Rainbow Theme ที่สวยงาม

## ✨ Features

- 📊 **Admin Dashboard** - จัดการเด็ก พฤติกรรม และรางวัล
- 👶 **Child Interface** - หน้าต่างสำหรับเด็กใช้งาน 
- 🌈 **Pastel Rainbow Theme** - ธีมสีรุ้ง pastel สำหรับเด็ก
- ⭐ **Point System** - ระบบคะแนนแรงจูงใจ
- 🎁 **Reward System** - ระบบแลกรางวัล
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- 🎨 **Avatar Generation** - สร้าง avatar อัตโนมัติ
- 👨‍👩‍👧‍👦 **Family Management** - จัดการครอบครัวและสมาชิก

## 🗄️ โครงสร้างฐานข้อมูล

- **Families** - ข้อมูลครอบครัว (mock data: F001, F002)
- **Children** - ข้อมูลเด็ก
- **Behaviors** - พฤติกรรมดี/ไม่ดี
- **Rewards** - รางวัลต่างๆ
- **DailyActivity** - บันทึกกิจกรรมประจำวัน

## 🛠️ เทคโนโลยี

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: MySQL (with API fallback to mock data)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Avatar**: Dicebear API

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
# API Configuration
VITE_API_URL=https://yourdomain.com/api.php

# Development
VITE_APP_ENV=development
VITE_APP_VERSION=3.0.0
```

### 3. รันโปรเจค

```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### 4. ตั้งค่า API (ถ้าต้องการใช้ฐานข้อมูลจริง)

1. อัพโหลด `api.php` ไปยัง web server
2. สร้างไฟล์ `config.php`:

```php
<?php
// config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mykids_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
?>
```

3. สร้างฐานข้อมูล MySQL ตาม schema ในโฟลเดอร์ `database/`

## 📱 การใช้งาน

### สำหรับผู้ปกครอง (Admin)

1. **Login** - เลือกครอบครัวจาก list (mock: ครอบครัวสมิท, ครอบครัวจอห์นสัน)
2. **จัดการเด็ก** - เพิ่ม แก้ไข ข้อมูลเด็ก
3. **จัดการพฤติกรรม** - กำหนดพฤติกรรมดี/ไม่ดี พร้อมคะแนน
4. **จัดการรางวัล** - เพิ่มรางวัลที่แลกได้ด้วยคะแนน
5. **ดูประวัติ** - ติดตามกิจกรรมและคะแนน

### สำหรับเด็ก (Child Interface)

1. **เลือกชื่อ** - เด็กเลือกชื่อตัวเองเพื่อเข้าใช้
2. **บันทึกกิจกรรม** - เลือกพฤติกรรมที่ทำแล้วเพื่อเก็บคะแนน
3. **ดูคะแนน** - ติดตามคะแนนส่วนตัว
4. **แลกรางวัล** - ใช้คะแนนแลกรางวัลที่ต้องการ

## 📂 โครงสร้างโปรเจค

```
MyKids/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── admin/           # Components สำหรับ Admin
│   │   │   ├── AdminOverview.jsx
│   │   │   ├── ChildrenManagement.jsx
│   │   │   ├── BehaviorsManagement.jsx
│   │   │   ├── RewardsManagement.jsx
│   │   │   └── ActivitiesHistory.jsx
│   │   ├── child/           # Components สำหรับเด็ก
│   │   │   ├── ChildDashboard.jsx
│   │   │   ├── ChildBehaviors.jsx
│   │   │   └── ChildRewards.jsx
│   │   ├── common/          # Components ใช้ร่วมกัน
│   │   │   ├── Avatar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── shared/          # Components แบ่งปัน
│   │       └── BehaviorList.jsx
│   ├── hooks/               # Custom Hooks
│   │   ├── useAuth.jsx
│   │   └── useData.jsx
│   ├── pages/               # หน้าหลัก
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ChildInterface.jsx
│   ├── services/            # API Services
│   │   └── api.js
│   ├── styles/              # CSS Styles
│   │   └── global.css
│   ├── utils/               # Utility Functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx              # Main App Component
│   └── main.jsx             # Entry Point
├── api.php                  # PHP API Backend
├── quick-start.php          # API Test Interface
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎨 Design System

### สีหลัก (Pastel Rainbow Theme)

```css
/* Pastel Colors */
--pastel-pink: #FFE4E1
--pastel-purple: #E6E6FA  
--pastel-blue: #E0E6FF
--pastel-cyan: #E0FFFF
--pastel-green: #E6FFE6
--pastel-yellow: #FFF8DC
--pastel-orange: #FFEFD5
--pastel-red: #FFEBEE
```

### Typography

- **หลัก**: Sarabun (Thai font)
- **เด็ก**: Comic Sans MS (สำหรับ Child Interface)

## 🔧 API Endpoints

Base URL: `https://yourdomain.com/api.php`

### GET Endpoints

- `?health` - ตรวจสอบสถานะ API
- `?families` - ข้อมูลครอบครัวทั้งหมด
- `?children` - ข้อมูลเด็กทั้งหมด
- `?children&familyId=F001` - เด็กในครอบครัว F001
- `?behaviors` - พฤติกรรมทั้งหมด
- `?behaviors&type=Good` - พฤติกรรมดี
- `?behaviors&type=Bad` - พฤติกรรมไม่ดี
- `?rewards` - รางวัลทั้งหมด
- `?activities` - กิจกรรมทั้งหมด
- `?activities&childId=C001` - กิจกรรมของเด็ก C001
- `?dashboard` - ข้อมูลสรุปภาพรวม

### POST Endpoints

- `?children` - เพิ่มเด็กใหม่
- `?behaviors` - เพิ่มพฤติกรรมใหม่
- `?rewards` - เพิ่มรางวัลใหม่
- `?activities` - บันทึกกิจกรรม

## 💡 Features ใหม่ (Version 3.0)

- ✅ **Family Management** - ระบบจัดการครอบครัว
- ✅ **Mock Data Fallback** - ใช้งานได้โดยไม่ต้องมีฐานข้อมูล
- ✅ **Enhanced UI/UX** - ปรับปรุง UI ให้สวยงามขึ้น
- ✅ **Avatar Generation** - สร้าง avatar อัตโนมัติ
- ✅ **Point Calculation** - คำนวณคะแนนรวมแบบ real-time
- ✅ **Activity Tracking** - ติดตามกิจกรรมครบถ้วน
- ✅ **Responsive Design** - รองรับ mobile และ tablet
- ✅ **Error Handling** - จัดการข้อผิดพลาดครอบคลุม

## 🧪 การทดสอบ

### ทดสอบ API

1. เปิด `quick-start.php` ในเบราว์เซอร์
2. ทดสอบ endpoints ทั้งหมดได้ผ่าน UI
3. ดู response format และข้อมูล mock

### ทดสอบ React App

```bash
# รัน development server
npm run dev

# เปิด http://localhost:3000
# เลือกครอบครัว: "ครอบครัวสมิท" หรือ "ครอบครัวจอห์นสัน"
# ทดสอบ admin และ child interface
```

## 🌐 Deployment

### Frontend (React)

```bash
# Build for production
npm run build

# Deploy 'dist' folder to web server
# หรือใช้ Vercel, Netlify, etc.
```

### Backend (PHP API)

1. อัพโหลด `api.php` และ `config.php` ไปยัง web server
2. ตั้งค่าฐานข้อมูล MySQL
3. อัพเดท `VITE_API_URL` ใน `.env` ของ React app

## 🤝 การพัฒนาต่อ

### Todo List

- [ ] ระบบ Authentication ที่สมบูรณ์
- [ ] ระบบการแจ้งเตือน (Push Notifications)  
- [ ] กราฟแสดงสถิติ (Charts & Analytics)
- [ ] ระบบ Backup/Restore
- [ ] Mobile App (React Native)
- [ ] ระบบอัพโหลดรูปภาพ
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export ข้อมูลเป็น PDF/Excel

### การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. สร้าง Pull Request

## 📞 ติดต่อ & สนับสนุน

- **Email**: support@mykids.app
- **GitHub**: https://github.com/your-username/mykids
- **Documentation**: https://mykids.app/docs

## 📄 License

MIT License - ดูไฟล์ `LICENSE` สำหรับรายละเอียด

## 🙏 Credits

- **UI Components**: Tailwind CSS, Lucide React
- **Avatars**: Dicebear API
- **Fonts**: Google Fonts (Sarabun)
- **Icons**: Lucide Icons

---

**Made with 💖 for kids | Version 3.0.0**

## 🔧 Environment Variables

```env
# .env.example
# API Configuration
VITE_API_URL=https://yourdomain.com/api.php

# App Configuration  
VITE_APP_ENV=development
VITE_APP_VERSION=3.0.0
VITE_APP_NAME=MyKids

# Debug Options
VITE_DEBUG_MODE=false
VITE_MOCK_API=false
```

## 📋 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```