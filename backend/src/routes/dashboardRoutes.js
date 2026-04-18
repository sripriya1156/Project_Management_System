const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/dashboard/admin', authMiddleware, adminOnly, dashboardController.getAdminDashboard);
router.get('/dashboard/hr', authMiddleware, dashboardController.getHRDashboard);

module.exports = router;
