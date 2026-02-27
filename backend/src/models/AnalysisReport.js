const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobRole',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tfidfScore: {
      type: Number,
      default: 0,
    },
    skillMatchScore: {
      type: Number,
      default: 0,
    },
    experienceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    educationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    skillMatches: [
      {
        skillName: String,
        category: String,
        required: Boolean,
        found: Boolean,
        requiredLevel: String,
        weight: Number,
        score: Number,
      },
    ],
    missingSkills: [
      {
        skillName: String,
        category: String,
        importance: String,
        weight: Number,
      },
    ],
    matchedSkills: [
      {
        skillName: String,
        category: String,
        confidence: Number,
      },
    ],
    recommendations: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        skillName: String,
        reason: String,
      },
    ],
    categoryBreakdown: [
      {
        category: String,
        matched: Number,
        total: Number,
        percentage: Number,
      },
    ],
    experienceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    educationDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

analysisReportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
