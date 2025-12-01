const express = require('express');
const router = express.Router();

const {
  getSummary,
  getOrdersByDate,
  getTopCustomers,
  getAverageOrderValue,
  getRepeatCustomers
} = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/orders-by-date', getOrdersByDate);
router.get('/top-customers', getTopCustomers);
router.get('/average-order-value', getAverageOrderValue);
router.get('/repeat-customers', getRepeatCustomers);

module.exports = router;
