from flask import Blueprint, request, jsonify
from ..analyzers.gap_analyzer import GapAnalyzer

analyze_bp = Blueprint("analyze", __name__)

# Initialize the analyzer once at module level
gap_analyzer = GapAnalyzer()


@analyze_bp.route("/analyze", methods=["POST"])
def analyze_resume():
    """Analyze a resume against a job role and return a full gap analysis.

    Expects a JSON body:
        {
            "resume_text": str,          -- full text from the resume
            "resume_skills": [           -- skills found in the resume
                {"name": "Python", "category": "Programming Languages"},
                ...
            ],
            "required_skills": [         -- skills required by the job role
                {
                    "name": "Python",
                    "category": "Programming Languages",
                    "level": "advanced",
                    "weight": 1.5,
                    "isRequired": true
                },
                ...
            ],
            "job_description": str,       -- free-text job description (optional)
            "sections": dict,             -- section_name -> section_text (optional)
            "job_experience_level": str,  -- e.g. "senior" (optional)
            "resume_proficiency": dict    -- pre-computed proficiency data (optional)
        }

    Returns JSON with overall_score, tfidf_score, skill_match_score,
    experience_score, education_score, skill_matches, missing_skills,
    matched_skills, category_breakdown, proficiency_matches,
    experience_details, education_details, and summary.
    """
    # ------------------------------------------------------------------
    # Parse & validate request body
    # ------------------------------------------------------------------
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": "Invalid or missing JSON body. "
                     "Content-Type must be application/json."
        }), 400

    resume_text = data.get("resume_text")
    resume_skills = data.get("resume_skills")
    required_skills = data.get("required_skills")
    job_description = data.get("job_description", "")

    # New optional fields
    sections = data.get("sections") or {}
    job_experience_level = data.get("job_experience_level")
    resume_proficiency = data.get("resume_proficiency")

    # resume_text is required
    if not resume_text or not isinstance(resume_text, str) or not resume_text.strip():
        return jsonify({
            "error": "Field 'resume_text' is required and must be a non-empty string."
        }), 400

    # resume_skills must be a list
    if resume_skills is None or not isinstance(resume_skills, list):
        return jsonify({
            "error": "Field 'resume_skills' is required and must be a list."
        }), 400

    # required_skills must be a list
    if required_skills is None or not isinstance(required_skills, list):
        return jsonify({
            "error": "Field 'required_skills' is required and must be a list."
        }), 400

    # ------------------------------------------------------------------
    # Run analysis
    # ------------------------------------------------------------------
    try:
        result = gap_analyzer.analyze(
            resume_text=resume_text,
            resume_skills=resume_skills,
            required_skills=required_skills,
            job_description=job_description,
            sections=sections,
            job_experience_level=job_experience_level,
            resume_proficiency=resume_proficiency,
        )

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": f"An error occurred during analysis: {str(e)}"
        }), 500
