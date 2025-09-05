# 🌈 My-Kids - ระบบติดตามพฤติกรรมเด็ก

แอพพลิเคชันสำหรับติดตามพฤติกรรม การให้รางวัล และสร้างแรงจูงใจให้เด็กๆ

## 🚀 เริ่มต้นใช้งาน

### ติดตั้ง Dependencies
```bash
npm install
```

### สร้างฐานข้อมูล MySQL
```bash
# สร้างฐานข้อมูลด้วย MySQL
mysql -u root -p < database/schema.sql

# หรือใช้ npm script
npm run db:create
```

### รันโปรเจค
```bash
npm run dev
```

### Build สำหรับ Production
```bash
npm run build
```

## 🎨 Features

- 📊 **Admin Dashboard** - จัดการเด็ก พฤติกรรม และรางวัล
- 👶 **Child Interface** - หน้าต่างสำหรับเด็กใช้งาน
- 🌈 **Pastel Rainbow Theme** - ธีมสีรุ้ง pastel สำหรับเด็ก
- ⭐ **Point System** - ระบบคะแนนแรงจูงใจ
- 🎁 **Reward System** - ระบบแลกรางวัล
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ

## 🗄️ โครงสร้างฐานข้อมูล

- **children** - ข้อมูลเด็ก
- **behaviors** - พฤติกรรมดี/ไม่ดี
- **rewards** - รางวัลต่างๆ
- **daily_activity** - บันทึกกิจกรรมประจำวัน

## 🛠️ เทคโนโลยี

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📱 การใช้งาน

1. **Admin**: ใช้จัดการเด็ก เพิ่มพฤติกรรม และรางวัล
2. **Child**: เด็กใช้บันทึกพฤติกรรมและดูคะแนน
3. **Rewards**: ใช้คะแนนแลกรางวัลที่ต้องการ

## 📂 โครงสร้างโปรเจค

```
My-Kids/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── child/
│   │   └── common/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── hooks/
├── database/
│   └── schema.sql
└── README.md
```

## 🎯 Todo

- [ ] สร้าง Backend API (Node.js + Express)
- [ ] เชื่อมต่อฐานข้อมูล
- [ ] เพิ่มระบบ Authentication
- [ ] เพิ่มระบบการแจ้งเตือน
- [ ] เพิ่มกราฟแสดงสถิติ
- [ ] เพิ่มระบบ Backup/Restore

---
Made with 💖 for kids | Version 2.0
# My-Kids
