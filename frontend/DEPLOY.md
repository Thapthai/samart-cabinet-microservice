# Deploy Frontend ด้วย Docker Compose

## ข้อกำหนดบนเซิร์ฟเวอร์

- Docker และ Docker Compose
- ไฟล์ `.env` ในโฟลเดอร์ `frontend/` (ตั้งค่าแล้ว)

## ขั้นตอน Deploy

### 1. อัปโหลดโค้ดไปที่เซิร์ฟเวอร์

```bash
# ตัวอย่าง: clone หรือ scp โปรเจกต์ไปที่เซิร์ฟเวอร์
# จากนั้น cd เข้าโฟลเดอร์ frontend
cd /path/to/samart-cabinet-cu-app/frontend
```

### 2. ตรวจสอบ .env

ให้มีไฟล์ `frontend/.env` และมีตัวแปรอย่างน้อย:

- `NEXTAUTH_SECRET` — secret สำหรับ NextAuth (เปลี่ยนใน production)
- `NEXTAUTH_URL` — URL หน้าแอปที่ใช้เข้าถึง (รวม basePath) เช่น `http://localhost:4100/smart-cabinet-cu` หรือ `https://your-domain/smart-cabinet-cu`
- `NEXT_PUBLIC_BASE_PATH` — basePath ของ Next.js (เช่น `/smart-cabinet-cu`)
- `NEXT_PUBLIC_API_URL` — URL ของ Backend API (เช่น `http://localhost:4000/smart-cabinet-cu/api/v1`)
- `NEXT_PUBLIC_FIREBASE_*` — ถ้าใช้ Firebase (ดูใน `.env.example`)

อ้างอิงโครงและ key จาก **`.env.example`**

### 3. Build และรัน

```bash
# จากโฟลเดอร์ frontend (ใช้ --env-file .env เพื่อให้ Compose อ่านตัวแปรจาก .env)
docker compose -f docker/docker-compose.yml --env-file .env up -d --build
```

- `--build` = build image ใหม่
- `-d` = รันแบบแยกพื้นหลัง (detached)

### 4. ตรวจสอบ

```bash
# ดูสถานะ container
docker compose -f docker/docker-compose.yml ps

# ดู log
docker compose -f docker/docker-compose.yml logs -f frontend

# ทดสอบ health / เปิดแอป
curl -I http://localhost:4100/smart-cabinet-cu
```

Frontend จะ listen ที่ **port 4100**  
เข้าใช้แอป: **http://localhost:4100/smart-cabinet-cu** (หรือตาม host ที่ deploy)

---

## คำสั่งอื่นที่ใช้บ่อย

```bash
# หยุด
docker compose -f docker/docker-compose.yml down

# Build ใหม่แล้วรันใหม่ (หลัง pull code)
docker compose -f docker/docker-compose.yml --env-file .env up -d --build

# ดู log แบบ realtime
docker compose -f docker/docker-compose.yml logs -f frontend
```

---

## หมายเหตุ

- Build args `NEXT_PUBLIC_API_URL` และ `NEXT_PUBLIC_BASE_PATH` ต้องตรงกับสภาพแวดล้อม เพราะ Next.js bake ค่าเหล่านี้ตอน build
- ถ้าเปลี่ยนโดเมนหรือ port หลัง build แล้ว ต้อง build ใหม่ด้วยค่า `NEXT_PUBLIC_*` และ `NEXTAUTH_URL` ที่ถูกต้อง
- รายละเอียด Docker และ K8s: [frontend/docker/README.md](docker/README.md)
