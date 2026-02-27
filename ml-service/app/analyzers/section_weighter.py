import re


# Multiplier applied to a skill's contribution based on which resume section
# it was found in.  Experience section is valued highest because mentioning a
# skill in a job-context is a stronger signal than listing it.
SECTION_WEIGHTS = {
    "skills": 1.0,
    "experience": 1.2,
    "projects": 1.1,
    "summary": 1.0,
    "certifications": 1.1,
    "education": 0.9,
    "interests": 0.5,
    "hobbies": 0.5,
    "header": 0.8,
}

DEFAULT_WEIGHT = 0.8  # For skills not found in any recognised section


class SectionWeighter:
    """Weight skills differently based on which resume section they appear in."""

    def compute_weights(self, skills, sections):
        """Compute a weight multiplier for each skill based on section presence.

        For each skill, find which section(s) it appears in and return the
        **highest** applicable multiplier.

        Args:
            skills: List of dicts with at least a ``name`` key.
            sections: Dict of section_name -> section_text (from TextPreprocessor).

        Returns:
            Dict mapping skill name -> float weight multiplier.
        """
        if not skills or not sections:
            return {s.get("name", ""): DEFAULT_WEIGHT for s in (skills or [])}

        # Pre-lowercase all section texts for case-insensitive matching
        section_texts = {
            key.lower(): val.lower() if isinstance(val, str) else ""
            for key, val in sections.items()
        }

        result = {}
        for skill in skills:
            name = skill.get("name", "")
            if not name:
                continue
            result[name] = self._best_weight(name, section_texts)

        return result

    def _best_weight(self, skill_name, section_texts):
        """Return the highest section weight for the given skill."""
        skill_lower = skill_name.lower()
        # Build a simple boundary pattern for the skill name
        pattern = re.compile(
            r"(?<![a-zA-Z0-9])" + re.escape(skill_lower) + r"(?![a-zA-Z0-9])"
        )

        best = 0.0
        found_any = False

        for section_key, section_text in section_texts.items():
            if not section_text:
                continue
            if pattern.search(section_text):
                found_any = True
                weight = SECTION_WEIGHTS.get(section_key, DEFAULT_WEIGHT)
                if weight > best:
                    best = weight

        return best if found_any else DEFAULT_WEIGHT
