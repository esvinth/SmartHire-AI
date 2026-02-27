const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const analysisRoutes = require('./routes/analysis.routes');
const skillRoutes = require('./routes/skill.routes');
const jobRoleRoutes = require('./routes/jobRole.routes');
const courseRoutes = require('./routes/course.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', generalLimiter);
// File uploads are handled in-memory (no disk storage) for Vercel compatibility

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'SmartHire API is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/job-roles', jobRoleRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
