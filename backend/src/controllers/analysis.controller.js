const analysisService = require('../services/analysis.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.analyze = asyncHandler(async (req, res) => {
  const { resumeId, jobRoleId } = req.body;
  if (!resumeId || !jobRoleId) {
    return res.status(400).json(ApiResponse.error('resumeId and jobRoleId are required'));
  }

  const report = await analysisService.analyze(req.user._id, resumeId, jobRoleId);
  res.status(201).json(ApiResponse.success(report, 'Analysis completed'));
});

exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await analysisService.getByUser(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  res.json(ApiResponse.success(result));
});

exports.getById = asyncHandler(async (req, res) => {
  const report = await analysisService.getById(req.params.id, req.user._id);
  res.json(ApiResponse.success(report));
});

exports.delete = asyncHandler(async (req, res) => {
  await analysisService.delete(req.params.id, req.user._id);
  res.json(ApiResponse.success(null, 'Report deleted'));
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await analysisService.getStats(req.user._id);
  res.json(ApiResponse.success(stats));
});
