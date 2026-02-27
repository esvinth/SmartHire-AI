const express = require('express');
const router = express.Router();
const jobRoleController = require('../controllers/jobRole.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// All routes require authentication
router.use(authenticate);

// Public (authenticated) routes
router.get('/', jobRoleController.getAll);
router.get('/:id', jobRoleController.getById);

// Admin & HR routes
router.post('/', authorize('admin', 'hr'), jobRoleController.create);
router.put('/:id', authorize('admin', 'hr'), jobRoleController.update);

// Admin-only route
router.delete('/:id', authorize('admin'), jobRoleController.delete);

module.exports = router;
