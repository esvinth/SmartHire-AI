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
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'uploaded',
    });

    this.processResume(resume._id, file.path).catch((err) => {
      logger.error(`Background resume processing failed: ${err.message}`);
    });

    return resume;
  }

  async processResume(resumeId, filePath) {
    try {
      await Resume.findByIdAndUpdate(resumeId, { status: 'processing' });

      const mlResult = await mlClient.extractResume(filePath);

      await Resume.findByIdAndUpdate(resumeId, {
        status: 'processed',
        extractedText: mlResult.text || '',
        extractedSkills: mlResult.skills || [],
        contactInfo: mlResult.contact_info || {},
      });

      logger.info(`Resume ${resumeId} processed successfully`);
    } catch (error) {
      await Resume.findByIdAndUpdate(resumeId, {
        status: 'failed',
        processingError: error.message,
      });
      throw error;
    }
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

    await this.processResume(resume._id, resume.filePath);
    return Resume.findById(resume._id);
  }
}

module.exports = new ResumeService();
