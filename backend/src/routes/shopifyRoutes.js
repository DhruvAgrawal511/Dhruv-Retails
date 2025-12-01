const express = require('express');
const router = express.Router();
const shopify = require('../services/shopifyService');

router.get('/test-products', async (req, res) => {
  try {
    const response = await shopify.get('products.json');

    res.json({
      count: response.data.products.length,
      sampleProduct: response.data.products[0]
    });
  } catch (err) {
    console.error('Shopify error:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch from Shopify' });
  }
});

module.exports = router;
