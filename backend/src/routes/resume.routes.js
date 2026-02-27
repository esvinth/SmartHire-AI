const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

router.post('/upload', upload.single('file'), upload._addFilename, resumeController.upload);
router.get('/', resumeController.getAll);
router.get('/:id', resumeController.getById);
router.delete('/:id', resumeController.delete);
router.post('/:id/reprocess', resumeController.reprocess);

module.exports = router;
