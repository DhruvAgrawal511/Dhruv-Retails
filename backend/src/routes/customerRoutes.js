const express = require('express');
const router = express.Router();
const { syncCustomers } = require('../controllers/customerController');

router.get('/sync', syncCustomers);

module.exports = router;
