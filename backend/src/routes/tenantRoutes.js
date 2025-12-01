const express = require('express');
const router = express.Router();
const { onboardTenant } = require('../controllers/tenantController');

router.post('/onboard', onboardTenant);

module.exports = router;
