const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    duration: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
