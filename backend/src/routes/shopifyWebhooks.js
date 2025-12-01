const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { webhookQueue } = require('../queue');

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const hmacHeader = req.get('x-shopify-hmac-sha256');
  const topic = req.get('x-shopify-topic');
  const shop = req.get('x-shopify-shop-domain');
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_ACCESS_TOKEN || '';

  const body = req.body;
  const digest = crypto.createHmac('sha256', secret).update(body).digest('base64');
  if (hmacHeader !== digest) {
    console.warn('Invalid Shopify webhook HMAC');
    return res.status(401).send('Invalid HMAC');
  }

  try {
    const payload = JSON.parse(body.toString('utf8'));
    await webhookQueue.add('shopifyWebhook', { topic, payload, shop, tenantId: 1 });
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).send('Error');
  }
});

module.exports = router;
