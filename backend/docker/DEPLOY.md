# Deploy Backend ด้วย Docker Compose

## ข้อกำหนดบนเซิร์ฟเวอร์

- Docker และ Docker Compose
- ไฟล์ `.env` ในโฟลเดอร์ `backend/` (ตั้งค่าแล้ว)

## ขั้นตอน Deploy

### 1. อัปโหลดโค้ดไปที่เซิร์ฟเวอร์

```bash
# ตัวอย่าง: clone หรือ scp โปรเจกต์ไปที่เซิร์ฟเวอร์
# จากนั้น cd เข้าโฟลเดอร์ backend
cd /path/to/samart-cabinet-cu-app/backend
```

### 2. ตรวจสอบ .env

ให้มีไฟล์ `backend/.env` และมีตัวแปรอย่างน้อย:

- `DATABASE_URL` (หรือ DATABASE_USER, PASSWORD, NAME, HOST, PORT)
- `JWT_SECRET`
- อื่นๆ ตาม `.env.example`

### 3. Build และรัน

```bash
# จากโฟลเดอร์ backend
docker compose -f docker/docker-compose.yml up -d --build
```

- `--build` = build image ใหม่
- `-d` = รันแบบแยกพื้นหลัง (detached)

### 4. ตรวจสอบ

```bash
# ดูสถานะ container
docker compose -f docker/docker-compose.yml ps

# ดู log
docker compose -f docker/docker-compose.yml logs -f backend

# ทดสอบ health
curl http://localhost:4000/smart-cabinet-cu/api/v1/health
```

Backend จะ listen ที่ **port 4000**

---

## คำสั่งอื่นที่ใช้บ่อย

```bash
# หยุด
docker compose -f docker/docker-compose.yml down

# Build ใหม่แล้วรันใหม่ (หลัง pull code)
docker compose -f docker/docker-compose.yml up -d --build

# ดู log แบบ realtime
docker compose -f docker/docker-compose.yml logs -f backend
```
