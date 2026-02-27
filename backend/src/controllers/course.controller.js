const Course = require('../models/Course');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all courses (paginated, with search, level & skill filters)
// @route   GET /api/courses
// @access  Authenticated
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', level = '', skill = '' } = req.query;
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (level) {
    query.level = level;
  }

  if (skill) {
    query.skills = skill;
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('skills')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json(
    ApiResponse.success(
      {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Courses retrieved successfully'
    )
  );
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Authenticated
exports.getById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('skills');

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  res.json(ApiResponse.success(course, 'Course retrieved successfully'));
});

// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin
exports.create = asyncHandler(async (req, res) => {
  const { title, provider, url, description, skills, duration, level, rating, isFree, isActive } =
    req.body;

  const course = await Course.create({
    title,
    provider,
    url,
    description,
    skills,
    duration,
    level,
    rating,
    isFree,
    isActive,
  });

  const populated = await course.populate('skills');

  res.status(201).json(ApiResponse.success(populated, 'Course created successfully'));
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Admin
exports.update = asyncHandler(async (req, res) => {
  const { title, provider, url, description, skills, duration, level, rating, isFree, isActive } =
    req.body;

  const course = await Course.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const updated = await Course.findByIdAndUpdate(
    req.params.id,
    { title, provider, url, description, skills, duration, level, rating, isFree, isActive },
    { new: true, runValidators: true }
  ).populate('skills');

  res.json(ApiResponse.success(updated, 'Course updated successfully'));
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Admin
exports.delete = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  await Course.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success(null, 'Course deleted successfully'));
});
