# Dhruv Retails - Shopify Analytics Dashboard

A modern, full-stack analytics dashboard for Shopify multi-tenant stores built with **Node.js**, **React**, **Prisma**, **Redis**, and **BullMQ**.

## Features

### Core Features
- **Multi-tenant support**: Manage multiple Shopify stores
- **Shopify integration**: Sync products, customers, and orders in real-time
- **Analytics dashboard**: Revenue trends, top customers, repeat customer rates, average order value
- **User authentication**: Secure registration and login with JWT + bcrypt
- **Data persistence**: PostgreSQL database with Prisma ORM

### Optional Features (Implemented)
- **Redis caching**: 60-second TTL cache for analytics queries to reduce database load
- **Background jobs**: BullMQ queues for async Shopify sync and webhook processing
- **Shopify webhooks**: Receive and process real-time events with HMAC verification
- **Security hardening**: JWT authentication, bcrypt hashing, HMAC webhook validation

## Tech Stack

**Backend:**
- Node.js + Express.js
- Prisma 7 with PostgreSQL adapter
- Redis (Render managed)
- BullMQ for job queues
- Shopify Admin API

**Frontend:**
- React 18 + Vite
- React Router for navigation
- Recharts for data visualization
- Axios for HTTP requests
- Responsive CSS with modern design

**Deployment:**
- PostgreSQL (Render Managed Database)
- Redis (Render Managed Key-Value Store)
- Backend ready for Render Web Service
- Frontend ready for Render Static Site or Netlify

## 🏗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Dashboard                                                   │  │
│  │  ├─ Summary Cards (Customers, Orders, Revenue)             │  │
│  │  ├─ Orders by Date Chart (Recharts)                        │  │
│  │  ├─ Top Customers Table                                    │  │
│  │  ├─ 🔄 Refresh Button                                       │  │
│  │  └─ ⬇️ Sync from Shopify Button                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────┬──────────────────────────┘
                   │                      │
            HTTP/HTTPS (Axios)            │
                   │                      │
         ┌─────────▼──────────┐  ┌────────▼────────────┐
         │ Authentication     │  │ Analytics & Sync   │
         │ POST /auth/login   │  │ GET /analytics/*   │
         │ POST /auth/register│  │ GET /jobs/sync     │
         └──────────┬─────────┘  └────────┬───────────┘
                    │                     │
         ┌──────────▼─────────────────────▼──────────┐
         │                                           │
         │   BACKEND (Node.js + Express)           │
         │   ┌───────────────────────────────────┐ │
         │   │  API Routes & Controllers         │ │
         │   │  ├─ /auth                         │ │
         │   │  ├─ /analytics                    │ │
         │   │  ├─ /products, /customers, /orders
         │   │  ├─ /shopify/webhook             │ │
         │   │  └─ /jobs/sync                    │ │
         │   └───────────────────────────────────┘ │
         │            │              │              │
         │            ▼              ▼              │
         │      Prisma ORM    Redis Cache    BullMQ│
         │      (Database)    (60s TTL)       Queue │
         │                                           │
         └──────────┬──────────────────┬────────────┘
                    │                  │
        ┌───────────▼──┐   ┌──────────▼──────────┐
        │              │   │                     │
        │ PostgreSQL   │   │  Redis              │
        │ Database     │   │  Cache & Queues    │
        │              │   │                     │
        │ ┌──────────┐ │   │  Workers:          │
        │ │ Tenants  │ │   │  - Sync Worker     │
        │ │ Users    │ │   │  - Webhook Worker  │
        │ │ Products │ │   │                     │
        │ │ Orders   │ │   │  Cron (5 min):     │
        │ │ Customers│ │   │  - Auto Sync       │
        │ └──────────┘ │   │                     │
        └──────────────┘   └─────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │                          │
        │  Shopify Admin API       │
        │  (Real-time Integration) │
        │                          │
        │  ├─ GET /products       │
        │  ├─ GET /customers      │
        │  ├─ GET /orders         │
        │  └─ WEBHOOKS            │
        │     ├─ order/created    │
        │     ├─ customer/created │
        │     └─ product/created  │
        │                          │
        └──────────────────────────┘
```

### Data Flow
```
1. USER LOGIN
   Browser → POST /auth/login → JWT Token → Stored in localStorage

2. DASHBOARD REFRESH  
   Click 🔄 Refresh → GET /analytics/* → Cache hit/miss → UI updates

3. MANUAL SYNC
   Click ⬇️ Sync → GET /jobs/sync → syncAllTenants() → DB updated → Refresh

4. AUTOMATIC SYNC (Every 5 minutes)
   Cron triggers → Fetch from Shopify → Upsert to DB

5. WEBHOOK SYNC (Real-time)
   Shopify webhook → HMAC verified → Worker processes → Data synced
```

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or Render)
- Redis server (local or Render)
- Shopify store + API credentials

## Local Setup

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@host:port/database"
REDIS_URL="rediss://default:password@host:port"
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_ACCESS_TOKEN="your_api_token"
SHOPIFY_API_VERSION="2025-10"
JWT_SECRET="your_secret_key_here"
JWT_EXPIRES_IN="7d"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"
```

**Frontend** (`frontend/src/api/api.js`):
```javascript
const API = axios.create({
  baseURL: "http://localhost:4000"  // Change for production
});
```

### 3. Set Up Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 4. Start Development Servers

**Terminal 1 - Backend (runs on port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (runs on port 5173/5174):**
```bash
cd frontend
npm run dev
```

### 5. Access the App

- **Frontend**: https://dhruv-retails-site.onrender.com
- **Backend API**: https://dhruv-retails.onrender.com/

## Usage

### Register & Login
1. Navigate to https://dhruv-retails-site.onrender.com/register
2. Create an account with email and password
3. Login with your credentials
4. View the analytics dashboard

### Dashboard Features
- **Summary Cards**: Total customers, orders, revenue, AOV, repeat rate
- **Orders by Date Chart**: Visual trend of orders over time
- **Top Customers Table**: List of highest-spending customers
- **Refresh Button**: Manually refresh data from backend
- **Logout**: Secure session logout

### API Endpoints

#### Authentication

| Method | Endpoint | Body Parameters | Response |
|--------|----------|-----------------|----------|
| `POST` | `/auth/register` | `email`, `password` | `{ token, user: { id, email } }` |
| `POST` | `/auth/login` | `email`, `password` | `{ token, user: { id, email } }` |

**cURL Example:**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123"}'
```

#### Analytics (All require JWT token in `Authorization: Bearer {token}` header)

| Method | Endpoint | Query Parameters | Response Format |
|--------|----------|------------------|-----------------|
| `GET` | `/analytics/summary` | `tenantId=1` | `{ totalCustomers, totalOrders, totalRevenue, repeatRate, avgOrderValue }` |
| `GET` | `/analytics/orders-by-date` | `tenantId=1` | `[{ date, total, count }]` |
| `GET` | `/analytics/top-customers` | `tenantId=1&limit=5` | `[{ customerId, name, totalSpent, orderCount }]` |
| `GET` | `/analytics/average-order-value` | `tenantId=1` | `{ averageOrderValue, totalOrders }` |
| `GET` | `/analytics/repeat-customers` | `tenantId=1` | `{ repeatRate, repeatCount, totalCustomers }` |

**cURL Example:**
```bash
curl -X GET "http://localhost:4000/analytics/summary?tenantId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Shopify Integration & Background Jobs

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `POST` | `/shopify/webhook` | Receive Shopify webhooks (HMAC verified) | `{ success: true }` |
| `GET` | `/jobs/sync` | Trigger **immediate** blocking sync | `{ message, productsCount, customersCount, ordersCount }` |
| `POST` | `/jobs/sync` | Enqueue **async** sync job | `{ jobId, message }` |

**cURL Example:**
```bash
# Immediate sync (blocking - waits for completion)
curl -X GET http://localhost:4000/jobs/sync

# Async sync (returns immediately with job ID)
curl -X POST http://localhost:4000/jobs/sync
```

## Background Job Queue & Scheduling

The app uses **BullMQ** with Redis for robust background processing:

- **Webhook Worker** - Processes incoming Shopify webhooks and triggers immediate data sync
- **Sync Worker** - Handles bulk API calls to Shopify and database updates
- **Cron Job** - Runs automatic full sync every **5 minutes** as a fallback mechanism

**How Syncing Works:**
1. Shopify sends webhook → Webhook Worker triggers immediate `syncData()` 
2. Cron job runs every 5 minutes → Full sync for all tenants
3. User clicks "Sync from Shopify" button → Calls `GET /jobs/sync` for instant refresh

## Security Features

- JWT authentication with configurable expiry
- Bcrypt password hashing (10 salt rounds)
- Shopify webhook HMAC verification
- Environment variables for sensitive data
- CORS protection
- Rate limiting ready (infrastructure in place)

## Database Schema

**Models:**
- `Tenant` - Store/workspace
- `User` - User accounts
- `Product` - Shopify products
- `Customer` - Shopify customers
- `Order` - Shopify orders
- `OrderItem` - Order line items
- `Event` - Webhook & system events

## Deployment (Render)

### Backend Deployment

1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Connect your repository
4. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Redis connection string
   - `SHOPIFY_*` - Shopify API credentials
   - `JWT_SECRET` - Secure random string
5. Deploy

### Frontend Deployment

1. Update `frontend/src/api/api.js`:
   ```javascript
   baseURL: "https://dhruv-retails.onrender.com/"
   ```

2. Create a new **Static Site** on Render
3. Connect your repository (frontend folder)
4. Build command: `npm run build`
5. Deploy

## Performance Optimizations

- **Redis caching**: 60-second TTL for analytics queries
- **Parallel API calls**: Frontend loads all data simultaneously
- **Job queue**: Heavy operations (sync) run asynchronously
- **Efficient queries**: Prisma aggregations and counts
- **Responsive UI**: Mobile-first design

##  Testing

### Manual Testing
1. Create account and login
2. Verify dashboard loads and displays data
3. Test refresh button
4. Check logout functionality

### API Testing (curl or Postman)
```bash
# Register
curl -X POST https://dhruv-retails-site.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://dhruv-retails-site.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get analytics
curl -X GET "https://dhruv-retails-site.onrender.com/analytics/summary?tenantId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

**Redis connection error?**
- Ensure `REDIS_URL` is set correctly in `.env`
- Check Render Redis inbound IP rules allow your IP
- Redis fallback logs a warning but doesn't crash the app

**Database connection error?**
- Verify `DATABASE_URL` connection string
- Ensure PostgreSQL is running (if local)
- Run `npx prisma migrate dev`

**Frontend API calls fail?**
- Check `baseURL` in `frontend/src/api/api.js`
- Verify backend is running on the correct port
- Check browser console for CORS errors

**Job queue not processing?**
- Verify Redis is connected (check server logs)
- Ensure BullMQ workers are initialized in `backend/src/queue/index.js`

## 🗄 Database Schema

### Prisma Models

```prisma
model Tenant {
  id                  Int       @id @default(autoincrement())
  name                String
  shopifyStoreDomain  String    @unique
  shopifyAccessToken  String
  users               User[]
  products            Product[]
  customers           Customer[]
  orders              Order[]
  events              Event[]
  createdAt           DateTime  @default(now())
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String  // bcrypt hashed
  tenantId  Int
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
}

model Product {
  id          Int     @id @default(autoincrement())
  shopifyId   String  @unique
  title       String
  description String?
  price       Float?
  currency    String  @default("INR")
  imageUrl    String?
  tenantId    Int
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Customer {
  id        Int     @id @default(autoincrement())
  shopifyId String  @unique
  firstName String?
  lastName  String?
  email     String?
  phone     String?
  city      String?
  tags      String?
  orders    Order[]
  tenantId  Int
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id                Int         @id @default(autoincrement())
  shopifyId         String      @unique
  orderNumber       String
  customerId        Int?
  customer          Customer?   @relation(fields: [customerId], references: [id])
  totalPrice        Float?
  currency          String      @default("INR")
  shopifyCreatedAt  DateTime?
  analyticsDate     DateTime?
  financialStatus   String?
  fulfillmentStatus String?
  items             OrderItem[]
  tenantId          Int
  tenant            Tenant      @relation(fields: [tenantId], references: [id])
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  title     String
  quantity  Int
  price     Float?
  createdAt DateTime @default(now())
}

model Event {
  id        Int     @id @default(autoincrement())
  tenantId  Int
  tenant    Tenant  @relation(fields: [tenantId], references: [id])
  type      String  // e.g., "order/created", "webhook"
  payload   String  // JSON stringified
  createdAt DateTime @default(now())
}
```

### Database Relationships
```
Tenant (1) ──→ (Many) User
Tenant (1) ──→ (Many) Product  
Tenant (1) ──→ (Many) Customer
Tenant (1) ──→ (Many) Order
Tenant (1) ──→ (Many) Event
Customer (1) ──→ (Many) Order
Order (1) ──→ (Many) OrderItem
```

##  Known Limitations & Assumptions

### Limitations
1. **Single Tenant Context** - Currently hardcoded to `tenantId = 1`
2. **Shopify API Rate Limits** - No exponential backoff (40 req/min limit)
3. **Webhook Delivery** - No guaranteed delivery; cron job (5 min) acts as fallback
4. **Caching** - 60-second TTL may show stale data; no manual invalidation
5. **Frontend Pagination** - Top customers fixed to 5 records
6. **No Data Export** - CSV/PDF export not implemented
7. **No Date Filtering** - Analytics show all-time data only

### Assumptions
1. **Single Shopify Store Per Tenant** - One access token per user
2. **PostgreSQL Only** - Prisma configured for PostgreSQL
3. **Redis Availability** - App continues but degrades without Redis
4. **UTC Timezone** - All dates stored/displayed in UTC
5. **Valid Shopify Credentials** - No credential validation on startup
6. **Order Immutability** - Orders treated as immutable after creation

### Future Improvements
- [ ] Date range filtering
- [ ] CSV/PDF export
- [ ] Shopify rate limit handling
- [ ] Webhook retry mechanism
- [ ] Multi-tenant routing
- [ ] Real-time updates (Socket.io)
- [ ] Email reports

## Project Structure

```
fde-assignment/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth & logging
│   │   ├── queue/             # BullMQ workers
│   │   ├── index.js           # Express server
│   │   └── prismaClient.js    # Prisma setup
│   ├── prisma/
│   │   ├── schema.prisma      # Data models
│   │   └── migrations/        # DB migrations
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── api/               # API client
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🎓 Learning Points

This project demonstrates:
- Full-stack JavaScript development (MERN + Node)
- RESTful API design with Express
- ORM usage (Prisma) for database abstraction
- Authentication & security best practices
- Background job processing with queues
- Real-time Shopify API integration
- Responsive UI with React and modern styling
- Deployment to cloud platforms

## 📄 License

Open source - free to use and modify.

## 👨‍💻 Author

Built as part of the Xeno FDE Internship Assignment (December 2025)

---

**Ready to deploy? Follow the deployment section above to push to production!**
