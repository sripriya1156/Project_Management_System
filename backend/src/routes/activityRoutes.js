const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/auth');

router.get('/projects/:projectId/logs', authMiddleware, activityController.getProjectLogs);

module.exports = router;
