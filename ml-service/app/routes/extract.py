from flask import Blueprint, request, jsonify
from ..extractors.pdf_extractor import PDFExtractor
from ..extractors.text_preprocessor import TextPreprocessor
from ..extractors.skill_extractor import SkillExtractor
from ..extractors.proficiency_detector import ProficiencyDetector
from ..extractors.experience_extractor import ExperienceExtractor
from ..extractors.education_extractor import EducationExtractor

extract_bp = Blueprint("extract", __name__)

# Initialize extractors once at module level
pdf_extractor = PDFExtractor()
text_preprocessor = TextPreprocessor()
skill_extractor = SkillExtractor()
proficiency_detector = ProficiencyDetector()
experience_extractor = ExperienceExtractor()
education_extractor = EducationExtractor()


@extract_bp.route("/extract", methods=["POST"])
def extract_resume():
    """Extract text, skills, and sections from an uploaded PDF resume.

    Expects a multipart/form-data POST with a 'file' field containing a PDF.

    Returns JSON:
        {
            "text": "<raw extracted text>",
            "skills": [{"name": "...", "category": "...", "confidence": ...}, ...],
            "sections": {"education": "...", "experience": "...", ...},
            "proficiency_levels": {"Python": {"level": "advanced", ...}, ...},
            "experience": {"total_years": 5, "seniority_level": "mid", ...},
            "education": {"degree": "bachelors", "field": "Computer Science", ...}
        }
    """
    # Validate file upload
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Please include a 'file' field."}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    try:
        # Read file bytes
        file_bytes = file.read()

        if not file_bytes:
            return jsonify({"error": "Uploaded file is empty."}), 400

        # Step 1: Extract raw text from PDF
        raw_text = pdf_extractor.extract(file_bytes)

        if not raw_text or len(raw_text.strip()) < 10:
            return jsonify({
                "error": "Could not extract text from the PDF. "
                         "The file may be image-based or corrupted."
            }), 422

        # Step 2: Preprocess text for skill extraction
        cleaned_text = text_preprocessor.clean_text(raw_text)

        # Step 3: Extract sections from raw text (before heavy cleaning)
        sections = text_preprocessor.extract_sections(raw_text)

        # Step 4: Extract skills with section awareness
        skills = skill_extractor.extract(raw_text, sections=sections)

        # Step 5: Detect proficiency levels for each extracted skill
        proficiency_levels = proficiency_detector.detect(raw_text, skills)

        # Step 6: Extract experience data
        experience = experience_extractor.extract(raw_text, sections=sections)

        # Step 7: Extract education data
        education = education_extractor.extract(raw_text, sections=sections)

        return jsonify({
            "text": raw_text.strip(),
            "skills": skills,
            "sections": sections,
            "proficiency_levels": proficiency_levels,
            "experience": experience,
            "education": education,
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred during extraction: {str(e)}"}), 500
