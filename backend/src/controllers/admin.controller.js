const User = require('../models/User');
const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const Skill = require('../models/Skill');
const Course = require('../models/Course');
const JobRole = require('../models/JobRole');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [userCount, resumeCount, analysisCount, skillCount, courseCount, jobRoleCount] =
    await Promise.all([
      User.countDocuments(),
      Resume.countDocuments(),
      AnalysisReport.countDocuments(),
      Skill.countDocuments(),
      Course.countDocuments(),
      JobRole.countDocuments(),
    ]);

  // Recent analyses with scores
  const recentAnalyses = await AnalysisReport.find({ status: 'completed' })
    .populate('user', 'name email')
    .populate('jobRole', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('overallScore skillMatchScore tfidfScore status createdAt');

  // Role distribution
  const roleDistribution = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json(
    ApiResponse.success(
      {
        counts: {
          users: userCount,
          resumes: resumeCount,
          analyses: analysisCount,
          skills: skillCount,
          courses: courseCount,
          jobRoles: jobRoleCount,
        },
        recentAnalyses,
        roleDistribution,
      },
      'Admin stats retrieved successfully'
    )
  );
});

// @desc    Get all users (paginated, with search)
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json(
    ApiResponse.success(
      {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Users retrieved successfully'
    )
  );
});

// @desc    Update user (role, isActive)
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === req.params.id && isActive === false) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  // Prevent admin from removing their own admin role
  if (req.user._id.toString() === req.params.id && role && role !== 'admin') {
    throw ApiError.badRequest('You cannot change your own admin role');
  }

  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json(ApiResponse.success(updated, 'User updated successfully'));
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success(null, 'User deleted successfully'));
});
