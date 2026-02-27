const Course = require('../models/Course');
const Skill = require('../models/Skill');

class CourseService {
  async getAll({ page = 1, limit = 10, search = '', level = '', skill = '' }) {
    const query = { isActive: true };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (level) query.level = level;
    if (skill) query.skills = skill;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('skills', 'name category')
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getById(id) {
    return Course.findById(id).populate('skills', 'name category');
  }

  async getRecommendations(missingSkillNames) {
    if (!missingSkillNames.length) return [];

    const skills = await Skill.find({
      name: { $in: missingSkillNames },
    });
    const skillIds = skills.map((s) => s._id);

    const courses = await Course.find({
      skills: { $in: skillIds },
      isActive: true,
    })
      .populate('skills', 'name category')
      .sort({ rating: -1 })
      .limit(20);

    return courses.map((course) => {
      const relevantSkills = course.skills
        .filter((s) => missingSkillNames.includes(s.name))
        .map((s) => s.name);
      return {
        course: course._id,
        courseTitle: course.title,
        provider: course.provider,
        url: course.url,
        level: course.level,
        rating: course.rating,
        duration: course.duration,
        skillsCovered: relevantSkills,
        reason: `Covers: ${relevantSkills.join(', ')}`,
      };
    });
  }

  async create(data) {
    return Course.create(data);
  }

  async update(id, data) {
    return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Course.findByIdAndDelete(id);
  }
}

module.exports = new CourseService();
