const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Programming Languages',
        'Web Frameworks',
        'Databases',
        'Cloud & DevOps',
        'Data Science & ML',
        'Mobile Development',
        'Testing',
        'Tools & Platforms',
        'Soft Skills',
        'Design',
        'Other',
      ],
    },
    aliases: [{ type: String }],
    weight: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 5.0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

skillSchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
