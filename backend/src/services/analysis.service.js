const AnalysisReport = require('../models/AnalysisReport');
const Resume = require('../models/Resume');
const JobRole = require('../models/JobRole');
const mlClient = require('./ml-client.service');
const courseService = require('./course.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class AnalysisService {
  async analyze(userId, resumeId, jobRoleId) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.status !== 'processed') throw ApiError.badRequest('Resume must be processed first');

    const jobRole = await JobRole.findById(jobRoleId).populate('requiredSkills.skill');
    if (!jobRole) throw ApiError.notFound('Job role not found');

    let report = await AnalysisReport.create({
      user: userId,
      resume: resumeId,
      jobRole: jobRoleId,
      status: 'processing',
    });

    try {
      const requiredSkills = jobRole.requiredSkills.map((rs) => ({
        name: rs.skill?.name || 'Unknown',
        category: rs.skill?.category || 'Other',
        level: rs.level,
        weight: rs.weight,
        isRequired: rs.isRequired,
      }));

      const jobDescription = `${jobRole.title}. ${jobRole.description}. Required skills: ${requiredSkills.map((s) => s.name).join(', ')}`;

      const mlResult = await mlClient.analyzeResume({
        resume_text: resume.extractedText,
        resume_skills: resume.extractedSkills.map((s) => ({ name: s.name, category: s.category })),
        required_skills: requiredSkills,
        job_description: jobDescription,
        sections: resume.sections || {},
        job_experience_level: jobRole.experienceLevel || null,
      });

      const missingSkillNames = (mlResult.missing_skills || []).map((s) => s.skillName);
      const recommendations = await courseService.getRecommendations(missingSkillNames);

      report = await AnalysisReport.findByIdAndUpdate(
        report._id,
        {
          status: 'completed',
          overallScore: mlResult.overall_score || 0,
          tfidfScore: mlResult.tfidf_score || 0,
          skillMatchScore: mlResult.skill_match_score || 0,
          experienceScore: mlResult.experience_score || 0,
          educationScore: mlResult.education_score || 0,
          skillMatches: mlResult.skill_matches || [],
          missingSkills: mlResult.missing_skills || [],
          matchedSkills: mlResult.matched_skills || [],
          categoryBreakdown: mlResult.category_breakdown || [],
          experienceDetails: mlResult.experience_details || {},
          educationDetails: mlResult.education_details || {},
          summary: mlResult.summary || '',
          recommendations,
        },
        { new: true }
      );

      return report;
    } catch (error) {
      await AnalysisReport.findByIdAndUpdate(report._id, { status: 'failed' });
      logger.error('Analysis failed:', error.message);
      throw error;
    }
  }

  async getByUser(userId, { page = 1, limit = 10 }) {
    const query = { user: userId };
    const total = await AnalysisReport.countDocuments(query);
    const reports = await AnalysisReport.find(query)
      .populate('resume', 'originalName')
      .populate('jobRole', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getById(reportId, userId) {
    const report = await AnalysisReport.findOne({ _id: reportId, user: userId })
      .populate('resume', 'originalName extractedSkills')
      .populate('jobRole', 'title description requiredSkills')
      .populate('recommendations.course', 'title provider url duration level rating');

    if (!report) throw ApiError.notFound('Report not found');
    return report;
  }

  async delete(reportId, userId) {
    const report = await AnalysisReport.findOneAndDelete({ _id: reportId, user: userId });
    if (!report) throw ApiError.notFound('Report not found');
    return report;
  }

  async getStats(userId) {
    const reports = await AnalysisReport.find({ user: userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!reports.length) return { avgScore: 0, totalAnalyses: 0, trend: [] };

    const avgScore = reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length;
    const trend = reports.map((r) => ({
      date: r.createdAt,
      score: r.overallScore,
    })).reverse();

    return { avgScore: Math.round(avgScore), totalAnalyses: reports.length, trend };
  }
}

module.exports = new AnalysisService();
