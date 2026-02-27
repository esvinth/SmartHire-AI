const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', analysisController.analyze);
router.get('/', analysisController.getAll);
router.get('/stats', analysisController.getStats);
router.get('/:id', analysisController.getById);
router.delete('/:id', analysisController.delete);

module.exports = router;
