const express = require('express');
const router = express.Router();
const { syncProducts } = require('../controllers/productController');

router.get('/sync', syncProducts);

module.exports = router;
