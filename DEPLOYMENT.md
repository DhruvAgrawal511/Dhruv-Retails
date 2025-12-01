# Deployment Guide - Dhruv Retails

## Quick Render Deployment (Recommended)

### Prerequisites
- Render account (https://render.com)
- GitHub repository with code
- PostgreSQL and Redis services already created on Render

---

## Step 1: Deploy Backend (Web Service)

### 1.1 Create Backend Service on Render

1. Log in to Render dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `fde-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: Singapore (same as your DB)

### 1.2 Set Environment Variables

In Render **Environment** tab, add:

```
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require
REDIS_URL=rediss://default:password@host:port
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxx
SHOPIFY_API_VERSION=2025-10
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=7d
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
PORT=4000
```

### 1.3 Deploy

Click **Deploy** and wait for build to complete (2-5 minutes).

Once deployed, you'll get a URL like: `https://fde-backend.onrender.com`

---

## Step 2: Deploy Frontend (Static Site)

### 2.1 Update API Base URL

Before deploying, update `frontend/src/api/api.js`:

```javascript
const API = axios.create({
  baseURL: "https://fde-backend.onrender.com"  // Use your actual backend URL
});
```

Commit and push this change to GitHub.

### 2.2 Create Frontend Service on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `fde-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Branch**: `main` (or your branch)

### 2.3 Deploy

Click **Deploy** and wait for build to complete (1-3 minutes).

Once deployed, you'll get a URL like: `https://fde-frontend.onrender.com`

---

## Step 3: Verify Deployment

1. Open frontend URL in browser
2. Register a new account
3. Login with your credentials
4. Verify dashboard loads and displays data
5. Test refresh button

If anything fails, check the Render **Logs** for error details.

---

## Step 4: Configure Shopify Webhooks (Optional)

If you want to receive real-time Shopify events:

1. Go to your Shopify store admin
2. Settings → Apps and integrations → Develop apps
3. Select your custom app
4. Configuration → Webhooks
5. Add webhook:
   - **URL**: `https://fde-backend.onrender.com/shopify/webhook`
   - **Topic**: `orders/create` (and/or others)
   - **API version**: `2025-10`

Shopify will send webhook events to your backend, which enqueues them to BullMQ for processing.

---

## Monitoring & Troubleshooting

### Check Backend Logs
1. Render dashboard → **fde-backend** service
2. Click **Logs** tab
3. Watch real-time logs for errors

Look for:
- `Server listening on port 4000` (server started)
- `Redis connected successfully` (Redis connected)
- Any error messages (none expected)

### Check Frontend Logs
1. Render dashboard → **fde-frontend** service
2. Click **Logs** tab
3. Watch for build errors

### Test API Endpoint

```bash
curl https://fde-backend.onrender.com/

# Should return:
# {"message":"Dhruv Retails backend is running"}
```

### Common Issues

**Backend won't start:**
- Check environment variables are set
- Verify DATABASE_URL and REDIS_URL are correct
- Check Render MySQL IP rules if using private database

**Frontend blank page:**
- Open browser DevTools (F12)
- Check **Console** for errors
- Verify backend URL in `api.js` is correct
- Check **Network** tab for failed API calls

**Webhook events not processing:**
- Verify webhook URL is correct in Shopify admin
- Check backend logs for webhook requests
- Ensure Redis is connected

---

## Optional: Custom Domain

1. In Render service settings → **Custom Domain**
2. Add your domain (e.g., `analytics.yourdomain.com`)
3. Follow DNS instructions
4. Wait for SSL certificate (automatic)

---

## Scaling & Performance

- **Database**: Render auto-scales PostgreSQL
- **Redis**: Monitor memory usage; upgrade plan if needed
- **Backend**: Render scales horizontally; set max instances in settings
- **Frontend**: Static site is always fast (CDN cached)

---

## Backup & Maintenance

- **Database backup**: Render auto-backs up PostgreSQL daily
- **Redis backup**: Manual exports via Render dashboard (optional)
- **Secrets**: Use Render environment variables, never commit `.env`

---

## Cost Estimate (Render Free/Paid Tiers)

- **PostgreSQL**: $7/month (starter) + $0.115/GB/month storage
- **Redis**: $2/month (starter) + $0.25/GB/month
- **Backend Web Service**: $7/month (starter) auto-scales to paid
- **Frontend Static Site**: Free

**Total**: ~$16/month for production-grade setup

---

## Next Steps

1. Deploy backend first
2. Deploy frontend (after updating API URL)
3. Test locally by visiting frontend URL
4. Share the URL with stakeholders!

---

**Questions? Check Render docs**: https://render.com/docs
