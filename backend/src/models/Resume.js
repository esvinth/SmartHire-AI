const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    extractedText: {
      type: String,
      default: '',
    },
    extractedSkills: [
      {
        name: String,
        category: String,
        confidence: { type: Number, default: 1.0 },
      },
    ],
    contactInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    processingError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
