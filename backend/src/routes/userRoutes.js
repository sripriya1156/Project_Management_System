const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.post('/access_providing', authMiddleware, adminOnly, userController.provideAccess);
router.get('/workload', authMiddleware, userController.getWorkload);
router.get('/', authMiddleware, userController.getUsers);

module.exports = router;
