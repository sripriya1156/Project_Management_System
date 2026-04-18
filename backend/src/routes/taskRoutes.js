const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

router.put('/:taskId/reassign', authMiddleware, taskController.reassignTask);
router.get('/my-tasks', authMiddleware, taskController.getMyTasks);
router.get('/pending', authMiddleware, taskController.getPendingTasks);
router.post('/:taskId/accept', authMiddleware, taskController.acceptTask);
router.post('/:taskId/reject', authMiddleware, taskController.rejectTask);
router.put('/:taskId/status', authMiddleware, taskController.updateTaskStatus);

module.exports = router;
