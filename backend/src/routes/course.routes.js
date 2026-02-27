const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// All routes require authentication
router.use(authenticate);

// Public (authenticated) routes
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);

// Admin-only routes
router.post('/', authorize('admin'), courseController.create);
router.put('/:id', authorize('admin'), courseController.update);
router.delete('/:id', authorize('admin'), courseController.delete);

module.exports = router;
