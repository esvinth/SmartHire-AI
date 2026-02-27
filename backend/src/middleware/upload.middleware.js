const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { maxFileSize } = require('../config/env');
const ApiError = require('../utils/ApiError');

// Use memory storage so it works on Vercel (read-only filesystem)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

// Attach a generated filename to the file object after upload
upload._addFilename = (req, res, next) => {
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    req.file.filename = `${uuidv4()}${ext}`;
  }
  next();
};

module.exports = upload;
