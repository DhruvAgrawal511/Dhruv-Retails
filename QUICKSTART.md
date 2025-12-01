# Quick Start Guide - Dhruv Retails

Get up and running in 5 minutes!

## Local Setup (Fastest)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running (local or remote)
- Redis running (local or remote)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 2. Configure Environment

**Backend only:**

Copy `backend/.env.example` to `backend/.env` and fill in:

```bash
# For local development with Docker:
DATABASE_URL="postgresql://postgres:password@localhost:5432/fde_db"
REDIS_URL="redis://127.0.0.1:6379"

# For Shopify (get from your Shopify App settings):
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_..."
SHOPIFY_API_VERSION="2025-10"

# Generate random secrets:
JWT_SECRET="$(openssl rand -base64 32)"
```

### 3. Start Services (if local)

**Option A: Docker (Recommended)**
```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7
```

**Option B: Manual**
- Start PostgreSQL server locally
- Start Redis server locally

### 4. Setup Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5174
```

### 6. Use the App

1. Open browser to `http://localhost:5174`
2. Click "Create one" to register
3. Login with your credentials
4. View dashboard with real data!

---

## Production Setup (Render)

### Prerequisites
- GitHub account with your code pushed
- Render account (https://render.com)

### 1. Create PostgreSQL (5 min)

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `fde-db`
3. Region: Singapore
4. Create → Save connection string

### 2. Create Redis (5 min)

1. Render Dashboard → **New +** → **Key Value**
2. Name: `fde-redis`
3. Region: Singapore
4. Create → Copy external connection URL

### 3. Deploy Backend (3 min)

1. Render Dashboard → **New +** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - Name: `fde-backend`
   - Build: `npm install`
   - Start: `npm start`
4. Environment variables (copy from earlier):
   ```
   DATABASE_URL=[from PostgreSQL]
   REDIS_URL=[from Redis]
   SHOPIFY_STORE_DOMAIN=...
   SHOPIFY_ACCESS_TOKEN=...
   JWT_SECRET=...
   ```
5. **Deploy**
6. Wait 2-5 min → get URL like `https://fde-backend.onrender.com`

### 4. Deploy Frontend (2 min)

1. Update `frontend/src/api/api.js`:
   ```javascript
   baseURL: "https://fde-backend.onrender.com"
   ```
   Push to GitHub

2. Render Dashboard → **New +** → **Static Site**
3. Connect GitHub repo
4. Build command: `cd frontend && npm install && npm run build`
5. Publish directory: `frontend/dist`
6. **Deploy**
7. Wait 1-3 min → get URL like `https://fde-frontend.onrender.com`

### Done! Visit your frontend URL!

---

## 🧪 Quick Testing

### Test Backend API

```bash
# Health check
curl http://localhost:4000/

# Register user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Copy the token from response

# Get analytics (replace TOKEN)
curl "http://localhost:4000/analytics/summary?tenantId=1" \
  -H "Authorization: Bearer TOKEN"
```

### Test Frontend UI

1. Register on login page
2. Verify dashboard loads
3. Click refresh button
4. Check logout button works

---

## 🐛 Troubleshooting

**Backend won't start?**
```
Error: ECONNREFUSED - Redis/PostgreSQL not running
→ Start Docker containers or services
→ Check DATABASE_URL and REDIS_URL in .env
```

**Frontend shows blank page?**
```
Error: API calls failing
→ Check backend URL in frontend/src/api/api.js
→ Verify backend is running on port 4000
→ Check browser console for errors (F12)
```

**Database errors?**
```
Error: Prisma migration failed
→ Run: npx prisma migrate dev --name init
→ Check PostgreSQL is running and accessible
```

**Port already in use?**
```
Error: EADDRINUSE - port 4000/5174 already in use
→ Kill process: lsof -ti:4000 | xargs kill -9
→ Or use different port: npm run dev -- --port 3000
```

---

## 📚 Learn More

- **Full README**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Assignment Checklist**: See `ASSIGNMENT_CHECKLIST.md`
- **Code Structure**: Browse `backend/src/` and `frontend/src/`

---

## What You Can Do

- View analytics dashboard
- Register/login with secure auth
- Sync Shopify products, customers, orders
- Monitor revenue, customers, repeat rates
- View historical order trends
- See top spending customers
- Manual sync via `/jobs/sync` API
- Receive Shopify webhooks automatically

---

## 💡 Pro Tips

1. **Speed up local dev**: Use `npm run dev` with nodemon (auto-restarts)
2. **Debug API**: Use Postman or REST Client extensions
3. **Monitor Redis**: Use RedisInsight (free tool)
4. **Database exploration**: Use DBeaver or pgAdmin
5. **Check logs**: Backend logs all Shopify API calls

---

**Ready? Run the commands in section 1 and you're live!**

Questions? Check README.md and DEPLOYMENT.md for detailed guides.
