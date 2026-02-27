from flask import Blueprint, jsonify
from ..extractors.skill_extractor import SkillExtractor

skills_bp = Blueprint("skills", __name__)

# Initialize skill extractor once at module level
skill_extractor = SkillExtractor()


@skills_bp.route("/skills", methods=["GET"])
def get_skills():
    """Return the full skills database.

    Returns JSON:
        {
            "skills": [
                {"name": "Python", "category": "Programming Languages", "aliases": [...]},
                ...
            ],
            "total": 150
        }
    """
    skills_db = skill_extractor.get_skills_database()
    return jsonify({
        "skills": skills_db,
        "total": len(skills_db),
    }), 200


@skills_bp.route("/skills/categories", methods=["GET"])
def get_categories():
    """Return the list of unique skill categories.

    Returns JSON:
        {
            "categories": ["Cloud & DevOps", "Data Science & ML", ...],
            "total": 10
        }
    """
    categories = skill_extractor.get_categories()
    return jsonify({
        "categories": categories,
        "total": len(categories),
    }), 200
