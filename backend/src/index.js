const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

const shopifyWebhookRoutes = require('./routes/shopifyWebhooks');
app.use('/shopify', shopifyWebhookRoutes);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Dhruv Retails backend is running' });
});

const shopifyRoutes = require('./routes/shopifyRoutes');
app.use('/shopify', shopifyRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);
const prisma = require('./prismaClient'); 

const customerRoutes = require('./routes/customerRoutes');
app.use('/customers', customerRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/analytics', analyticsRoutes);
const authRoutes = require('./routes/authRoutes');

app.use('/auth', authRoutes);
const tenantRoutes = require('./routes/tenantRoutes');

app.use('/tenants', tenantRoutes);
const cron = require('node-cron');
const { syncAllTenants } = require('./services/syncService');

const eventRoutes = require('./routes/eventRoutes');
app.use('/events', eventRoutes);

require('./queue');

const jobsRoutes = require('./routes/jobs');
app.use('/jobs', jobsRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


cron.schedule('*/15 * * * *', async () => {
  console.log('Running scheduled Shopify sync...');
  try {
    await syncAllTenants();
    console.log('Scheduled sync completed');
  } catch (err) {
    console.error('Scheduled sync failed:', err);
  }
});



