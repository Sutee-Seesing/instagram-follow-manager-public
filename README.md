# Public Checker

เว็บหน้านี้เป็นเวอร์ชันสำหรับผู้ใช้ทั่วไปเพื่อเช็คว่าใครไม่ฟอลกลับ โดยอัปโหลด ZIP จาก Instagram

โครงสร้าง repo นี้เป็น public-only และเป็น static website ทั้งหมด (ไม่มี backend)

เว็บไซต์ที่เปิดใช้งานจริง:

https://instagram-follow-manager-public.pages.dev/

## วิธีใช้งาน

1. เปิด `index.html`
2. อัปโหลดไฟล์ ZIP ที่ดาวน์โหลดจาก Instagram
3. กดปุ่มวิเคราะห์ข้อมูล
4. ดูผลลัพธ์และดาวน์โหลด CSV

## Deploy ฟรี

## Cloudflare Pages

1. สร้างโปรเจกต์ใหม่จาก Git repository
2. Root directory เว้นว่าง (ใช้ root ของ repo นี้)
3. Build command เว้นว่าง
4. Output directory เป็น `.`
5. Deploy

## Vercel

1. Import repository
2. Root Directory เว้นว่าง (ใช้ root ของ repo นี้)
3. Framework preset เป็น `Other`
4. Deploy

## Netlify

1. Add new site from Git
2. Base directory เว้นว่าง (ใช้ root ของ repo นี้)
3. Build command เว้นว่าง
4. Publish directory เป็น `.`
5. Deploy