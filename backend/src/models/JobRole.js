const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate',
        },
        weight: { type: Number, default: 1.0, min: 0.1, max: 5.0 },
        isRequired: { type: Boolean, default: true },
      },
    ],
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'principal'],
      default: 'mid',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);
