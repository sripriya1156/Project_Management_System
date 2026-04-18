const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// --- Static/Literal GET routes FIRST (before any /:id wildcards) ---
router.get('/my-projects-admin', authMiddleware, adminOnly, projectController.getMyCreatedProjects);
router.get('/my-pending-managed-projects', authMiddleware, projectController.getMyPendingManagedProjects);
router.get('/my-projects', authMiddleware, projectController.getMyProjects);
router.get('/my-managed-projects', authMiddleware, projectController.getMyManagedProjects);
router.get('/my-rejected-projects', authMiddleware, projectController.getMyRejectedProjects);
router.get('/', authMiddleware, adminOnly, projectController.getAllProjects);

// --- Static POST routes ---
router.post('/create', authMiddleware, adminOnly, projectController.createProject);
router.post('/create-project-with-assignments', authMiddleware, adminOnly, projectController.createProjectWithAssignments);

// IMPORTANT: More-specific routes before less-specific ones
router.post('/create/:projectid/addMembers/:memberid/assign_task', authMiddleware, projectController.assignTask);
router.post('/create/:id/addMembers', authMiddleware, projectController.addMember);

// --- Dynamic /:id routes LAST ---
router.get('/:id', authMiddleware, projectController.getProjectDetails);
router.get('/:id/members', authMiddleware, projectController.getProjectMembers);
router.get('/:id/tasks', authMiddleware, projectController.getProjectTasks);
router.get('/:id/rejected-tasks', authMiddleware, projectController.getRejectedTasks);

router.post('/:projectId/manager-response', authMiddleware, projectController.managerResponse);
router.put('/:projectId/reassign-manager', authMiddleware, adminOnly, projectController.reassignManager);
router.delete('/:id/members/:memberId', authMiddleware, projectController.removeMember);

module.exports = router;
