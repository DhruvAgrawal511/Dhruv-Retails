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

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:4000

## Usage

### Register & Login
1. Navigate to http://localhost:5174/register
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

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

**Analytics:**
- `GET /analytics/summary?tenantId=1` - Get summary metrics (cached 60s)
- `GET /analytics/orders-by-date?tenantId=1` - Get orders grouped by date
- `GET /analytics/top-customers?tenantId=1&limit=5` - Get top spending customers
- `GET /analytics/average-order-value?tenantId=1` - Get AOV metrics
- `GET /analytics/repeat-customers?tenantId=1` - Get repeat customer stats

**Shopify Integration:**
- `POST /products/sync` - Sync Shopify products
- `POST /customers/sync` - Sync Shopify customers
- `POST /orders/sync` - Sync Shopify orders
- `POST /shopify/webhook` - Receive Shopify webhooks (HMAC verified)

**Background Jobs:**
- `POST /jobs/sync` - Manually enqueue a full Shopify sync job

## Background Job Queue

The app uses **BullMQ** with Redis for background processing:

```javascript
// Enqueue a sync job
POST /jobs/sync
// Response: { "jobId": "job-123", "message": "Sync job enqueued" }
```

Workers automatically process jobs and log progress to console.

## 🔐 Security Features

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
   baseURL: "https://your-backend.onrender.com"
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

## 🧪 Testing

### Manual Testing
1. Create account and login
2. Verify dashboard loads and displays data
3. Test refresh button
4. Check logout functionality

### API Testing (curl or Postman)
```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get analytics
curl -X GET "http://localhost:4000/analytics/summary?tenantId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

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
