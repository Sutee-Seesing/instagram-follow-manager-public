# Public Checker

เว็บหน้านี้เป็นเวอร์ชันสำหรับผู้ใช้ทั่วไปเพื่อเช็คว่าใครไม่ฟอลกลับ โดยอัปโหลด ZIP จาก Instagram

## วิธีใช้งาน

1. เปิด `index.html`
2. อัปโหลดไฟล์ ZIP ที่ดาวน์โหลดจาก Instagram
3. กดปุ่มวิเคราะห์ข้อมูล
4. ดูผลลัพธ์และดาวน์โหลด CSV

## Deploy ฟรี

## Cloudflare Pages

1. สร้างโปรเจกต์ใหม่จาก Git repository
2. ตั้งค่า Root directory เป็น `public_web_checker`
3. Build command เว้นว่าง
4. Output directory เป็น `.`
5. Deploy

## Vercel

1. Import repository
2. ตั้งค่า Root Directory เป็น `public_web_checker`
3. Framework preset เป็น `Other`
4. Deploy

## Netlify

1. Add new site from Git
2. Base directory เป็น `public_web_checker`
3. Build command เว้นว่าง
4. Publish directory เป็น `public_web_checker`
5. Deploy