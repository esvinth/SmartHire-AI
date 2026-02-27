const resumeService = require('../services/resume.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('No file uploaded'));
  }

  const resume = await resumeService.upload(req.user._id, req.file);
  res.status(201).json(ApiResponse.success(resume, 'Resume uploaded successfully'));
});

exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const result = await resumeService.getByUser(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
  });
  res.json(ApiResponse.success(result, 'Resumes fetched'));
});

exports.getById = asyncHandler(async (req, res) => {
  const resume = await resumeService.getById(req.params.id, req.user._id);
  res.json(ApiResponse.success(resume));
});

exports.delete = asyncHandler(async (req, res) => {
  await resumeService.delete(req.params.id, req.user._id);
  res.json(ApiResponse.success(null, 'Resume deleted'));
});

exports.reprocess = asyncHandler(async (req, res) => {
  const resume = await resumeService.reprocess(req.params.id, req.user._id);
  res.json(ApiResponse.success(resume, 'Resume reprocessing started'));
});
