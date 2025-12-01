const express = require('express');
const router = express.Router();
const { syncOrders } = require('../controllers/orderController');

router.get('/sync', syncOrders);

module.exports = router;
