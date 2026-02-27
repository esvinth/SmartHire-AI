import re


# Proficiency level numeric mapping (higher = more proficient)
LEVEL_SCORES = {
    "expert": 1.0,
    "advanced": 0.75,
    "intermediate": 0.5,
    "beginner": 0.25,
}

# Patterns ordered from most specific (expert) to least (beginner).
# Each tuple: (level, compiled_regex, confidence_for_this_pattern)
_PROFICIENCY_PATTERNS = [
    # Expert indicators
    ("expert", re.compile(
        r"(?:expert(?:ise)?|mastery|deep expertise|"
        r"(?:8|9|10|\d{2})\+?\s*(?:years?|yrs?))"
        , re.IGNORECASE), 0.95),
    ("expert", re.compile(
        r"(?:authority|thought leader|architect(?:ed)?)\b"
        , re.IGNORECASE), 0.90),

    # Advanced indicators
    ("advanced", re.compile(
        r"(?:(?:strong|extensive|proficient|solid|advanced|in-depth)\s+(?:knowledge|experience|understanding|skills?))"
        , re.IGNORECASE), 0.90),
    ("advanced", re.compile(
        r"(?:proficient\s+(?:in|with)|highly\s+skilled|"
        r"(?:4|5|6|7)\+?\s*(?:years?|yrs?))"
        , re.IGNORECASE), 0.85),

    # Intermediate indicators
    ("intermediate", re.compile(
        r"(?:experience\s+(?:with|in|using)|worked\s+(?:with|on)|"
        r"(?:2|3)\+?\s*(?:years?|yrs?))"
        , re.IGNORECASE), 0.85),
    ("intermediate", re.compile(
        r"(?:comfortable\s+with|hands-on\s+experience|practical\s+experience|"
        r"good\s+(?:knowledge|understanding))"
        , re.IGNORECASE), 0.80),

    # Beginner indicators
    ("beginner", re.compile(
        r"(?:familiar\s+with|basic\s+(?:knowledge|understanding)|"
        r"exposure\s+to|learning|beginner|"
        r"(?:0|1)\+?\s*(?:years?|yrs?))"
        , re.IGNORECASE), 0.85),
    ("beginner", re.compile(
        r"(?:some\s+experience|introductory|coursework\s+in|"
        r"studied|academic\s+(?:knowledge|experience))"
        , re.IGNORECASE), 0.75),
]

# Pattern to extract years-of-experience numbers near a skill mention
_YEARS_PATTERN = re.compile(
    r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?"
    , re.IGNORECASE
)


class ProficiencyDetector:
    """Detect skill proficiency levels from surrounding resume context."""

    CONTEXT_WINDOW = 150  # characters around the skill mention to search

    def detect(self, text, skills):
        """Detect proficiency level for each skill based on surrounding context.

        Args:
            text: Full resume text.
            skills: List of dicts with at least a ``name`` key.

        Returns:
            Dict mapping skill name -> {
                level (str): expert/advanced/intermediate/beginner,
                score (float): numeric level (0.0-1.0),
                confidence (float): how confident we are in the detection,
                years (int|None): years of experience if mentioned
            }
        """
        if not text or not skills:
            return {}

        text_lower = text.lower()
        results = {}

        for skill in skills:
            name = skill.get("name", "")
            if not name:
                continue

            # Find all positions of the skill in text
            skill_lower = name.lower()
            contexts = self._get_skill_contexts(text_lower, skill_lower)

            if not contexts:
                # Skill not found in text – default to intermediate
                results[name] = {
                    "level": "intermediate",
                    "score": LEVEL_SCORES["intermediate"],
                    "confidence": 0.3,
                    "years": None,
                }
                continue

            # Check all context windows for proficiency signals
            best_level = None
            best_confidence = 0.0
            detected_years = None

            for ctx in contexts:
                # Check years of experience in context
                years_match = _YEARS_PATTERN.search(ctx)
                if years_match:
                    yrs = int(years_match.group(1))
                    detected_years = max(detected_years or 0, yrs)

                # Check proficiency patterns
                for level, pattern, conf in _PROFICIENCY_PATTERNS:
                    if pattern.search(ctx):
                        if conf > best_confidence:
                            best_level = level
                            best_confidence = conf
                        break  # take highest-priority match in this context

            # If years detected, use them to infer level (may override pattern match)
            if detected_years is not None:
                year_level = self._years_to_level(detected_years)
                year_score = LEVEL_SCORES[year_level]
                if best_level is None or year_score > LEVEL_SCORES.get(best_level, 0):
                    best_level = year_level
                    best_confidence = max(best_confidence, 0.80)

            # Fallback: if still no signal, default to intermediate
            if best_level is None:
                best_level = "intermediate"
                best_confidence = 0.4

            results[name] = {
                "level": best_level,
                "score": LEVEL_SCORES[best_level],
                "confidence": round(best_confidence, 2),
                "years": detected_years,
            }

        return results

    def _get_skill_contexts(self, text_lower, skill_lower):
        """Return list of context windows around each occurrence of skill in text."""
        contexts = []
        start = 0
        while True:
            idx = text_lower.find(skill_lower, start)
            if idx == -1:
                break
            ctx_start = max(0, idx - self.CONTEXT_WINDOW)
            ctx_end = min(len(text_lower), idx + len(skill_lower) + self.CONTEXT_WINDOW)
            contexts.append(text_lower[ctx_start:ctx_end])
            start = idx + 1
        return contexts

    @staticmethod
    def _years_to_level(years):
        """Map years of experience to a proficiency level."""
        if years >= 8:
            return "expert"
        elif years >= 4:
            return "advanced"
        elif years >= 2:
            return "intermediate"
        else:
            return "beginner"
