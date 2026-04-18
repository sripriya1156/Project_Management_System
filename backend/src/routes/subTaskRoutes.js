const express = require('express');
const router = express.Router();
const subTaskController = require('../controllers/subTaskController');
const authMiddleware = require('../middleware/auth');

// Create SubTask
router.post('/', authMiddleware, subTaskController.createSubTask);

// Get My SubTasks
router.get('/my-subtasks', authMiddleware, subTaskController.getMySubTasks);

// Get Project SubTasks
router.get('/project/:projectId', authMiddleware, subTaskController.getProjectSubTasks);

// Get SubTasks for a Task
router.get('/task/:taskId', authMiddleware, subTaskController.getSubTasksByTask);

// Update Status (Assigned User)
router.patch('/:id/status', authMiddleware, subTaskController.updateSubTaskStatus);

// Add Comment
router.post('/:id/comment', authMiddleware, subTaskController.addSubTaskComment);

// Delete SubTask
router.delete('/:id', authMiddleware, subTaskController.deleteSubTask);

module.exports = router;
