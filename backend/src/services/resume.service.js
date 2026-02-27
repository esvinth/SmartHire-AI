const Resume = require('../models/Resume');
const mlClient = require('./ml-client.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class ResumeService {
  async upload(userId, file) {
    const resume = await Resume.create({
      user: userId,
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'uploaded',
    });

    // Process synchronously — Vercel kills the function after response,
    // so background processing would lose the file buffer.
    try {
      await Resume.findByIdAndUpdate(resume._id, { status: 'processing' });

      const mlResult = await mlClient.extractResume(file.buffer, file.originalname);

      await Resume.findByIdAndUpdate(resume._id, {
        status: 'processed',
        extractedText: mlResult.text || '',
        extractedSkills: mlResult.skills || [],
        contactInfo: mlResult.contact_info || {},
      });

      logger.info(`Resume ${resume._id} processed successfully`);
    } catch (error) {
      await Resume.findByIdAndUpdate(resume._id, {
        status: 'failed',
        processingError: error.message,
      });
      logger.error(`Resume processing failed: ${error.message}`);
    }

    return Resume.findById(resume._id);
  }

  async getByUser(userId, { page = 1, limit = 10, search = '' }) {
    const query = { user: userId };
    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    const total = await Resume.countDocuments(query);
    const resumes = await Resume.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      resumes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');
    return resume;
  }

  async delete(resumeId, userId) {
    const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');
    return resume;
  }

  async reprocess(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');

    throw ApiError.badRequest(
      'Reprocessing requires re-uploading the file. Please upload the resume again.'
    );
  }
}

module.exports = new ResumeService();
