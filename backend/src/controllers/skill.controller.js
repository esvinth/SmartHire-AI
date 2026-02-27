const Skill = require('../models/Skill');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all skills (paginated, with search & category filter)
// @route   GET /api/skills
// @access  Authenticated
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', category = '' } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  const total = await Skill.countDocuments(query);
  const skills = await Skill.find(query)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json(
    ApiResponse.success(
      {
        skills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Skills retrieved successfully'
    )
  );
});

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Authenticated
exports.getById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw ApiError.notFound('Skill not found');
  }

  res.json(ApiResponse.success(skill, 'Skill retrieved successfully'));
});

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Admin
exports.create = asyncHandler(async (req, res) => {
  const { name, category, aliases, weight, isActive } = req.body;

  const existing = await Skill.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    throw ApiError.conflict('A skill with this name already exists');
  }

  const skill = await Skill.create({ name, category, aliases, weight, isActive });

  res.status(201).json(ApiResponse.success(skill, 'Skill created successfully'));
});

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Admin
exports.update = asyncHandler(async (req, res) => {
  const { name, category, aliases, weight, isActive } = req.body;

  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw ApiError.notFound('Skill not found');
  }

  // Check for duplicate name if name is being changed
  if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
    const existing = await Skill.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      throw ApiError.conflict('A skill with this name already exists');
    }
  }

  const updated = await Skill.findByIdAndUpdate(
    req.params.id,
    { name, category, aliases, weight, isActive },
    { new: true, runValidators: true }
  );

  res.json(ApiResponse.success(updated, 'Skill updated successfully'));
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Admin
exports.delete = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw ApiError.notFound('Skill not found');
  }

  await Skill.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success(null, 'Skill deleted successfully'));
});
