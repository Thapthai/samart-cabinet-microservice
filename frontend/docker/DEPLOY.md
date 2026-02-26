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

- **`NEXTAUTH_SECRET`** — **ต้องมีค่า** (ถ้าไม่ตั้ง Compose จะแจ้ง WARN และ session อาจผิดพลาด) ใช้ string ยาวๆ หรือ `openssl rand -base64 32`
- `NEXTAUTH_URL` — URL หน้าแอปที่ใช้เข้าถึง (รวม basePath) เช่น `http://localhost:4100/smart-cabinet-cu` หรือ `http://10.11.9.84:4100/smart-cabinet-cu`
- `NEXT_PUBLIC_BASE_PATH` — basePath ของ Next.js (เช่น `/smart-cabinet-cu`)
- **`NEXT_PUBLIC_API_URL`** — **เมื่อรันใน Docker อย่าใช้ `localhost`** เพราะจากใน container แล้ว localhost คือตัว container เอง ใช้ **IP โฮสต์** (เช่น `http://10.11.9.84:4000/smart-cabinet-cu/api/v1`) หรือถ้า Backend อยู่คนละเครื่องใช้ IP เครื่อง Backend
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

## แก้ปัญหา Login 401 (callback/credentials)

ถ้าเข้าแอปด้วย **IP หรือโดเมนจริง** (เช่น `http://10.11.9.84:4100/smart-cabinet-cu`) แล้วกด Login แล้วได้ **401 Unauthorized** ที่ `POST .../api/auth/callback/credentials` แปลว่า NextAuth ไปเรียก Backend ไม่ถูกหรือ Backend ตอบ 401

ให้ตั้งค่าใน **`frontend/.env`** ให้ตรงกับเครื่องที่ deploy (แทน localhost):

| ตัวแปร | ตัวอย่างเมื่อเข้าแอปที่ `http://10.11.9.84:4100` |
|--------|-----------------------------------------------|
| `NEXTAUTH_URL` | `http://10.11.9.84:4100/smart-cabinet-cu` |
| `NEXT_PUBLIC_API_URL` | `http://10.11.9.84:4000/smart-cabinet-cu/api/v1` |

- **NEXTAUTH_URL** = URL ที่ผู้ใช้เปิดแอป (ต้องตรงกับที่พิมพ์ในเบราว์เซอร์ รวม port และ basePath)
- **NEXT_PUBLIC_API_URL** = URL ที่ **frontend container** ใช้เรียก Backend (ถ้า Backend อยู่เครื่องเดียวกัน ใช้ IP โฮสต์ + port 4000 ถ้า Backend รันที่ 4000)

จากนั้น **รัน Compose ใหม่** ให้อ่าน env ล่าสุด (ไม่จำเป็นต้อง build ใหม่ถ้าแก้แค่ .env):

```bash
docker compose -f docker/docker-compose.yml --env-file .env up -d
```

ตรวจสอบว่า Backend รันที่ port 4000 และเข้าถึงได้จากเครื่องที่รัน Frontend (ถ้า Backend อยู่คนละเครื่อง ใช้ IP เครื่อง Backend แทน `10.11.9.84`)

---

## แก้ปัญหา ECONNREFUSED ตอน Login (Credentials auth error)

ถ้า log ขึ้น `Credentials auth error: ... code: 'ECONNREFUSED'` แปลว่า **frontend container ต่อ Backend ไม่ได้**

1. **ตั้ง `NEXTAUTH_SECRET`** ใน `frontend/.env` (เช่น `openssl rand -base64 32` แล้วใส่ค่าที่ได้)
2. **ตั้ง `NEXT_PUBLIC_API_URL` ให้ container ไปถึง Backend ได้**
   - ถ้า Backend รันบน **โฮสต์เดียวกัน** (ไม่ใช่ใน Docker): ใช้ **IP ของโฮสต์** ไม่ใช่ `localhost`  
     ตัวอย่าง: `NEXT_PUBLIC_API_URL=http://10.11.9.84:4000/smart-cabinet-cu/api/v1` (แทน 10.11.9.84 ด้วย IP จริงของเครื่องรัน Backend)
   - ถ้า Backend รันใน Docker Compose อีก stack: ต้องให้ frontend กับ backend อยู่ network เดียวกัน แล้วใช้ชื่อ service เช่น `http://backend:4000/smart-cabinet-cu/api/v1`
3. รัน Compose ด้วย **`--env-file .env`** เพื่อให้อ่านค่าจาก `.env`:  
   `docker compose -f docker/docker-compose.yml --env-file .env up -d --build`

---

## ให้ Frontend กับ Backend อยู่ network เดียวกัน (ใช้ชื่อ `backend`)

ถ้า Frontend และ Backend รันคนละ Compose (คนละโฟลเดอร์) โดยปกติจะอยู่คนละ network จึงต่อกันด้วยชื่อ service ไม่ได้ ต้องใช้ IP โฮสต์

ถ้าอยากให้ Frontend เรียก Backend ด้วย **`http://backend:4000/...`** ให้ใช้ **shared external network** แบบนี้:

1. **สร้าง network (ทำครั้งเดียว)** บนเครื่องที่รัน Docker:
   ```bash
   docker network create smart-cabinet-net
   ```

2. **รัน Backend** (จากโฟลเดอร์ backend):
   ```bash
   cd /path/to/samart-cabinet-cu-app/backend
   docker compose -f docker/docker-compose.yml --env-file .env up -d --build
   ```

3. **ตั้งค่า Frontend** ใน `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://backend:4000/smart-cabinet-cu/api/v1
   NEXTAUTH_URL=http://10.11.9.84:4100/smart-cabinet-cu
   ```
   (ใช้ IP จริงแทน 10.11.9.84 ตามที่ผู้ใช้เข้าแอป)

4. **รัน Frontend** (จากโฟลเดอร์ frontend):
   ```bash
   cd /path/to/samart-cabinet-cu-app/frontend
   docker compose -f docker/docker-compose.yml --env-file .env up -d --build
   ```

ทั้ง Backend และ Frontend compose ใช้ network `smart-cabinet-net` (external) แล้ว จึงเห็นกันด้วยชื่อ service `backend` / `frontend` และช่วยลดปัญหา 401 / ECONNREFUSED จากที่ Frontend ต่อ Backend ไม่ถึง

---

## หมายเหตุ

- Build args `NEXT_PUBLIC_API_URL` และ `NEXT_PUBLIC_BASE_PATH` ต้องตรงกับสภาพแวดล้อม เพราะ Next.js bake ค่าเหล่านี้ตอน build
- ถ้าเปลี่ยนโดเมนหรือ port หลัง build แล้ว ต้อง build ใหม่ด้วยค่า `NEXT_PUBLIC_*` และ `NEXTAUTH_URL` ที่ถูกต้อง
- รายละเอียด Docker และ K8s: [frontend/docker/README.md](README.md)
