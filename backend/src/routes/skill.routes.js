const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// All routes require authentication
router.use(authenticate);

// Public (authenticated) routes
router.get('/', skillController.getAll);
router.get('/:id', skillController.getById);

// Admin-only routes
router.post('/', authorize('admin'), skillController.create);
router.put('/:id', authorize('admin'), skillController.update);
router.delete('/:id', authorize('admin'), skillController.delete);

module.exports = router;
