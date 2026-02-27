from .tfidf_engine import TFIDFEngine
from .section_weighter import SectionWeighter
from ..extractors.proficiency_detector import ProficiencyDetector, LEVEL_SCORES
from ..extractors.experience_extractor import ExperienceExtractor
from ..extractors.education_extractor import EducationExtractor


class GapAnalyzer:
    """Multi-component skill matching and gap analysis engine.

    Combines:
      - TF-IDF cosine similarity (25%)
      - Weighted & proficiency-aware skill matching (35%)
      - Experience score (20%)
      - Education score (20%)
    to produce an overall candidate-to-job-role fit score.
    """

    # Default weight for required skills that have no explicit weight set
    DEFAULT_WEIGHT = 1.0

    # New four-component weight split
    TFIDF_WEIGHT = 0.25
    SKILL_MATCH_WEIGHT = 0.35
    EXPERIENCE_WEIGHT = 0.20
    EDUCATION_WEIGHT = 0.20

    def __init__(self):
        self.tfidf_engine = TFIDFEngine()
        self.section_weighter = SectionWeighter()
        self.proficiency_detector = ProficiencyDetector()
        self.experience_extractor = ExperienceExtractor()
        self.education_extractor = EducationExtractor()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(
        self,
        resume_text,
        resume_skills,
        required_skills,
        job_description="",
        sections=None,
        job_experience_level=None,
        resume_proficiency=None,
    ):
        """Run full gap analysis between a resume and a job role.

        Args:
            resume_text: Full text extracted from the resume.
            resume_skills: List of dicts with keys ``name`` and ``category``,
                representing skills found in the resume.
            required_skills: List of dicts describing the job role's required
                skills.  Each dict should contain:
                    - name (str)
                    - category (str)
                    - level (str) – e.g. "beginner", "intermediate", "advanced"
                    - weight (float) – importance weight, default 1.0
                    - isRequired (bool) – hard requirement flag
            job_description: Free-text job role description used for TF-IDF.
            sections: Optional dict of section_name -> section_text.
            job_experience_level: Optional expected experience level (e.g. "senior").
            resume_proficiency: Optional pre-computed proficiency dict
                (skill_name -> {level, score, confidence, years}).

        Returns:
            A dict containing all original fields plus new enriched data:
                - overall_score (float, 0-100)
                - tfidf_score (float, 0-1)
                - skill_match_score (float, 0-100)
                - experience_score (float, 0-100)     ← NEW
                - education_score (float, 0-100)       ← NEW
                - skill_matches (list of per-skill match detail dicts)
                - missing_skills (list of unmatched required skill dicts)
                - matched_skills (list of matched skill dicts)
                - category_breakdown (list of per-category summary dicts)
                - proficiency_matches (dict)            ← NEW
                - experience_details (dict)             ← NEW
                - education_details (dict)              ← NEW
                - summary (str)
        """
        try:
            # Normalise inputs so downstream logic never crashes on None
            resume_text = resume_text or ""
            resume_skills = resume_skills or []
            required_skills = required_skills or []
            job_description = job_description or ""
            sections = sections or {}

            # 1. TF-IDF cosine similarity (section-weighted) ---------------
            tfidf_score = self.tfidf_engine.compute_similarity(
                resume_text, job_description, sections=sections
            )

            # 2. Proficiency detection -------------------------------------
            if resume_proficiency:
                proficiency = resume_proficiency
            else:
                proficiency = self.proficiency_detector.detect(resume_text, resume_skills)

            # 3. Section weights -------------------------------------------
            section_weights = self.section_weighter.compute_weights(resume_skills, sections)

            # 4. Weighted & proficiency-aware skill matching ----------------
            skill_match_result = self._match_skills(
                resume_skills, required_skills, proficiency, section_weights
            )

            skill_match_score = skill_match_result["score"]
            skill_matches = skill_match_result["skill_matches"]
            missing_skills = skill_match_result["missing_skills"]
            matched_skills = skill_match_result["matched_skills"]
            proficiency_matches = skill_match_result["proficiency_matches"]

            # 5. Category breakdown ----------------------------------------
            category_breakdown = self._compute_category_breakdown(skill_matches)

            # 6. Experience extraction & scoring ---------------------------
            experience_details = self.experience_extractor.extract(resume_text, sections)
            experience_score = experience_details["experience_score"]

            # 7. Education extraction & scoring ----------------------------
            education_details = self.education_extractor.extract(resume_text, sections)
            education_score = education_details["education_score"]

            # 8. Overall composite score -----------------------------------
            overall_score = (
                self.TFIDF_WEIGHT * tfidf_score * 100
                + self.SKILL_MATCH_WEIGHT * skill_match_score
                + self.EXPERIENCE_WEIGHT * experience_score
                + self.EDUCATION_WEIGHT * education_score
            )
            overall_score = round(min(max(overall_score, 0.0), 100.0), 2)

            # 9. Human-readable summary ------------------------------------
            summary = self._build_summary(
                overall_score,
                tfidf_score,
                skill_match_score,
                matched_skills,
                missing_skills,
                required_skills,
                experience_score,
                education_score,
            )

            return {
                "overall_score": overall_score,
                "tfidf_score": round(tfidf_score, 4),
                "skill_match_score": round(skill_match_score, 2),
                "experience_score": round(experience_score, 2),
                "education_score": round(education_score, 2),
                "skill_matches": skill_matches,
                "missing_skills": missing_skills,
                "matched_skills": matched_skills,
                "category_breakdown": category_breakdown,
                "proficiency_matches": proficiency_matches,
                "experience_details": experience_details,
                "education_details": education_details,
                "summary": summary,
            }

        except Exception as e:
            # Return a safe default so the API never crashes
            return {
                "overall_score": 0.0,
                "tfidf_score": 0.0,
                "skill_match_score": 0.0,
                "experience_score": 0.0,
                "education_score": 0.0,
                "skill_matches": [],
                "missing_skills": [],
                "matched_skills": [],
                "category_breakdown": [],
                "proficiency_matches": {},
                "experience_details": {},
                "education_details": {},
                "summary": f"Analysis failed: {str(e)}",
            }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _normalise_name(self, name):
        """Lowercase and strip a skill name for comparison."""
        return (name or "").strip().lower()

    def _proficiency_match_score(self, candidate_level, required_level):
        """Score how well a candidate's proficiency matches the required level.

        Returns a float between 0.0 and 1.0:
          - Exact or exceeds: 1.0
          - One level below:  0.6
          - Two levels below: 0.3
          - Three levels below: 0.1
        """
        level_order = ["beginner", "intermediate", "advanced", "expert"]
        candidate_idx = level_order.index(candidate_level) if candidate_level in level_order else 1
        required_idx = level_order.index(required_level) if required_level in level_order else 1

        diff = required_idx - candidate_idx  # positive = candidate is below requirement

        if diff <= 0:
            return 1.0  # meets or exceeds
        elif diff == 1:
            return 0.6
        elif diff == 2:
            return 0.3
        else:
            return 0.1

    def _match_skills(self, resume_skills, required_skills, proficiency, section_weights):
        """Perform weighted skill matching with proficiency awareness.

        Returns a dict with ``score``, ``skill_matches``, ``missing_skills``,
        ``matched_skills``, and ``proficiency_matches``.
        """
        # Build a lookup set from the candidate's resume skills
        resume_skill_map = {}
        for skill in resume_skills:
            key = self._normalise_name(skill.get("name", ""))
            if key:
                resume_skill_map[key] = skill

        skill_matches = []
        missing_skills = []
        matched_skills = []
        proficiency_matches = {}

        total_weight = 0.0
        earned_weight = 0.0

        for req in required_skills:
            req_name = req.get("name", "")
            req_key = self._normalise_name(req_name)
            category = req.get("category", "Other")
            weight = float(req.get("weight", self.DEFAULT_WEIGHT))
            is_required = bool(req.get("isRequired", False))
            required_level = req.get("level", "intermediate")

            total_weight += weight

            found = req_key in resume_skill_map

            if found:
                # Get proficiency info for this skill
                prof = proficiency.get(req_name, proficiency.get(
                    resume_skill_map[req_key].get("name", ""), {}
                ))
                candidate_level = prof.get("level", "intermediate")

                # Proficiency-based partial credit
                prof_score = self._proficiency_match_score(candidate_level, required_level)

                # Section weight multiplier
                sw = section_weights.get(
                    resume_skill_map[req_key].get("name", req_name), 1.0
                )

                credit = weight * prof_score * sw
                earned_weight += credit

                matched_skills.append({
                    "skillName": req_name,
                    "category": category,
                    "confidence": resume_skill_map[req_key].get("confidence", 1.0),
                })

                proficiency_matches[req_name] = {
                    "required_level": required_level,
                    "candidate_level": candidate_level,
                    "proficiency_score": round(prof_score, 2),
                    "section_weight": round(sw, 2),
                }

                score = round(credit, 2)
            else:
                score = 0.0
                importance = "critical" if is_required else "nice-to-have"
                missing_skills.append({
                    "skillName": req_name,
                    "category": category,
                    "importance": importance,
                    "weight": weight,
                })

            skill_matches.append({
                "skillName": req_name,
                "category": category,
                "required": is_required,
                "found": found,
                "weight": weight,
                "score": score,
            })

        # Compute the weighted skill-match percentage (0-100)
        if total_weight > 0:
            skill_match_score = (earned_weight / total_weight) * 100
        else:
            skill_match_score = 0.0

        return {
            "score": round(skill_match_score, 2),
            "skill_matches": skill_matches,
            "missing_skills": missing_skills,
            "matched_skills": matched_skills,
            "proficiency_matches": proficiency_matches,
        }

    def _compute_category_breakdown(self, skill_matches):
        """Group skill matches by category and compute per-category percentages."""
        categories = {}

        for match in skill_matches:
            cat = match.get("category", "Other")
            if cat not in categories:
                categories[cat] = {"matched": 0, "total": 0}
            categories[cat]["total"] += 1
            if match.get("found", False):
                categories[cat]["matched"] += 1

        breakdown = []
        for category, counts in sorted(categories.items()):
            total = counts["total"]
            matched = counts["matched"]
            percentage = round((matched / total) * 100, 2) if total > 0 else 0.0
            breakdown.append({
                "category": category,
                "matched": matched,
                "total": total,
                "percentage": percentage,
            })

        return breakdown

    def _build_summary(
        self,
        overall_score,
        tfidf_score,
        skill_match_score,
        matched_skills,
        missing_skills,
        required_skills,
        experience_score=0.0,
        education_score=0.0,
    ):
        """Build a human-readable summary paragraph."""
        total_required = len(required_skills)
        total_matched = len(matched_skills)
        total_missing = len(missing_skills)

        # Determine qualitative rating
        if overall_score >= 80:
            rating = "Excellent"
        elif overall_score >= 60:
            rating = "Good"
        elif overall_score >= 40:
            rating = "Moderate"
        elif overall_score >= 20:
            rating = "Below Average"
        else:
            rating = "Poor"

        parts = [
            f"{rating} match ({overall_score:.1f}/100).",
            f"Resume-to-job textual similarity: {tfidf_score * 100:.1f}%.",
            f"Skill coverage: {total_matched}/{total_required} required skills matched ({skill_match_score:.1f}%).",
            f"Experience score: {experience_score:.1f}/100.",
            f"Education score: {education_score:.1f}/100.",
        ]

        if total_missing > 0:
            critical = [s["skillName"] for s in missing_skills if s.get("importance") == "critical"]
            if critical:
                parts.append(
                    f"Critical gaps: {', '.join(critical[:5])}"
                    + (" and more." if len(critical) > 5 else ".")
                )
            else:
                parts.append(
                    f"{total_missing} nice-to-have skill(s) not found on the resume."
                )

        return " ".join(parts)
