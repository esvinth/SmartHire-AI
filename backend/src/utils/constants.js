module.exports = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    HR: 'hr',
  },
  RESUME_STATUS: {
    UPLOADED: 'uploaded',
    PROCESSING: 'processing',
    PROCESSED: 'processed',
    FAILED: 'failed',
  },
  ANALYSIS_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  SKILL_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  },
  SKILL_CATEGORIES: [
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
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
