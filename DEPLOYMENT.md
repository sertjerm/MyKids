# 🚀 Deployment Guide - MyKids

## สำหรับ Netlify

1. Build project:
```bash
npm run build
```

2. Deploy ผ่าน Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir dist
```

3. หรือ drag & drop folder `dist` ใน Netlify dashboard

## สำหรับ Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

## สำหรับ GitHub Pages

1. Install gh-pages:
```bash
npm install -g gh-pages
```

2. Deploy:
```bash
npm run deploy:gh-pages
```

## การแก้ไขปัญหา White Screen

✅ ตั้งค่า `base: './'` ใน vite.config.js
✅ เพิ่ม `_redirects` สำหรับ Netlify
✅ เพิ่ม `vercel.json` สำหรับ Vercel  
✅ เพิ่ม `404.html` สำหรับ GitHub Pages
✅ เพิ่ม Error Boundary ใน React
✅ เพิ่ม Loading Screen

## ตรวจสอบหลัง Deploy

1. เปิด Developer Tools (F12)
2. เช็ค Console errors
3. เช็ค Network tab สำหรับ failed requests
4. ทดสอบ navigation ระหว่างหน้า

## URLs สำหรับทดสอบ

- `/` - หน้าแรก (Admin Dashboard)
- `/admin` - Admin Dashboard  
- `/child/child_001` - Child Dashboard

---
Made with 💖 for kids
