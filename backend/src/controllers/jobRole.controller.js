const JobRole = require('../models/JobRole');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all job roles (paginated, with search)
// @route   GET /api/job-roles
// @access  Authenticated
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const total = await JobRole.countDocuments(query);
  const jobRoles = await JobRole.find(query)
    .populate('requiredSkills.skill')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json(
    ApiResponse.success(
      {
        jobRoles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Job roles retrieved successfully'
    )
  );
});

// @desc    Get job role by ID
// @route   GET /api/job-roles/:id
// @access  Authenticated
exports.getById = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.findById(req.params.id).populate('requiredSkills.skill');

  if (!jobRole) {
    throw ApiError.notFound('Job role not found');
  }

  res.json(ApiResponse.success(jobRole, 'Job role retrieved successfully'));
});

// @desc    Create a new job role
// @route   POST /api/job-roles
// @access  Admin, HR
exports.create = asyncHandler(async (req, res) => {
  const { title, description, department, requiredSkills, experienceLevel, isActive } = req.body;

  const jobRole = await JobRole.create({
    title,
    description,
    department,
    requiredSkills,
    experienceLevel,
    isActive,
    createdBy: req.user._id,
  });

  const populated = await jobRole.populate('requiredSkills.skill');

  res.status(201).json(ApiResponse.success(populated, 'Job role created successfully'));
});

// @desc    Update a job role
// @route   PUT /api/job-roles/:id
// @access  Admin, HR
exports.update = asyncHandler(async (req, res) => {
  const { title, description, department, requiredSkills, experienceLevel, isActive } = req.body;

  const jobRole = await JobRole.findById(req.params.id);
  if (!jobRole) {
    throw ApiError.notFound('Job role not found');
  }

  const updated = await JobRole.findByIdAndUpdate(
    req.params.id,
    { title, description, department, requiredSkills, experienceLevel, isActive },
    { new: true, runValidators: true }
  ).populate('requiredSkills.skill');

  res.json(ApiResponse.success(updated, 'Job role updated successfully'));
});

// @desc    Delete a job role
// @route   DELETE /api/job-roles/:id
// @access  Admin
exports.delete = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.findById(req.params.id);
  if (!jobRole) {
    throw ApiError.notFound('Job role not found');
  }

  await JobRole.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success(null, 'Job role deleted successfully'));
});
