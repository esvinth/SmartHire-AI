import re
from datetime import datetime

try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
except Exception:
    _nlp = None


# --- Regex patterns -----------------------------------------------------------

_TOTAL_YEARS_PATTERNS = [
    re.compile(r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional\s+)?experience", re.IGNORECASE),
    re.compile(r"(?:over|more\s+than|approximately|~)\s*(\d+)\+?\s*(?:years?|yrs?)", re.IGNORECASE),
]

_DATE_RANGE_PATTERN = re.compile(
    r"(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?"
    r"((?:19|20)\d{2})"
    r"\s*[-–—to]+\s*"
    r"(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?"
    r"((?:19|20)\d{2}|present|current|now)",
    re.IGNORECASE,
)

_TITLE_PATTERNS = [
    re.compile(r"\b(" + "|".join([
        r"software\s+(?:engineer|developer|architect)",
        r"(?:senior|junior|lead|principal|staff)\s+(?:software\s+)?(?:engineer|developer)",
        r"(?:full[\s-]?stack|front[\s-]?end|back[\s-]?end|devops|cloud|data|ml|ai)\s+(?:engineer|developer)",
        r"(?:web|mobile|ios|android)\s+developer",
        r"data\s+(?:scientist|analyst|engineer)",
        r"machine\s+learning\s+engineer",
        r"(?:project|product|engineering|program)\s+manager",
        r"(?:technical|team|engineering)\s+lead",
        r"(?:qa|test|quality)\s+(?:engineer|analyst|lead)",
        r"(?:system|network|database|cloud)\s+(?:administrator|engineer|architect)",
        r"(?:ui|ux|ui/ux)\s+(?:designer|developer|engineer)",
        r"scrum\s+master",
        r"cto|cio|vp\s+of\s+engineering",
        r"(?:director|head)\s+of\s+(?:engineering|technology|development)",
        r"solutions?\s+architect",
        r"(?:business|systems?)\s+analyst",
        r"intern(?:ship)?",
    ]) + r")\b", re.IGNORECASE),
]

_SENIORITY_MAP = {
    "intern": "intern",
    "internship": "intern",
    "junior": "junior",
    "associate": "junior",
    "mid": "mid",
    "senior": "senior",
    "staff": "senior",
    "lead": "lead",
    "principal": "lead",
    "director": "lead",
    "head": "lead",
    "vp": "lead",
    "cto": "lead",
    "cio": "lead",
    "architect": "senior",
    "manager": "mid",
}

_SENIORITY_SCORES = {
    "intern": 10,
    "junior": 25,
    "mid": 50,
    "senior": 75,
    "lead": 90,
}


class ExperienceExtractor:
    """Extract work experience data from resume text using spaCy NER and regex."""

    def extract(self, text, sections=None):
        """Extract experience information from resume text.

        Args:
            text: Full resume text.
            sections: Optional dict of section_name -> section_text.

        Returns:
            Dict with:
                total_years (float): Estimated total years of experience
                seniority_level (str): intern/junior/mid/senior/lead
                job_titles (list[str]): Detected job titles
                experience_score (float): 0-100 score
        """
        if not text:
            return self._empty_result()

        experience_text = text
        if sections and "experience" in sections:
            experience_text = sections["experience"]

        total_years = self._extract_total_years(text, experience_text)
        date_years = self._compute_years_from_dates(experience_text)

        # Use the larger of explicit mentions vs date-range calculation
        if date_years and (total_years is None or date_years > total_years):
            total_years = date_years
        if total_years is None:
            total_years = 0.0

        job_titles = self._extract_job_titles(experience_text)
        seniority = self._detect_seniority(job_titles, total_years)

        experience_score = self._compute_score(total_years, seniority, len(job_titles))

        return {
            "total_years": round(total_years, 1),
            "seniority_level": seniority,
            "job_titles": job_titles,
            "experience_score": round(min(experience_score, 100.0), 2),
        }

    def _empty_result(self):
        return {
            "total_years": 0.0,
            "seniority_level": "junior",
            "job_titles": [],
            "experience_score": 0.0,
        }

    def _extract_total_years(self, full_text, experience_text):
        """Find explicit 'X years of experience' mentions."""
        for pattern in _TOTAL_YEARS_PATTERNS:
            for source in [full_text, experience_text]:
                match = pattern.search(source)
                if match:
                    return float(match.group(1))
        return None

    def _compute_years_from_dates(self, text):
        """Sum up years from date ranges like '2018 - 2022' or '2020 - Present'."""
        current_year = datetime.now().year
        total = 0.0
        for match in _DATE_RANGE_PATTERN.finditer(text):
            start_year = int(match.group(1))
            end_str = match.group(2).lower()
            if end_str in ("present", "current", "now"):
                end_year = current_year
            else:
                end_year = int(end_str)
            duration = end_year - start_year
            if 0 < duration <= 50:  # sanity check
                total += duration
        return total if total > 0 else None

    def _extract_job_titles(self, text):
        """Extract job titles using regex patterns and optionally spaCy NER."""
        titles = set()

        for pattern in _TITLE_PATTERNS:
            for match in pattern.finditer(text):
                title = match.group(1).strip()
                # Normalize spacing
                title = re.sub(r"\s+", " ", title)
                titles.add(title.title())

        # Supplement with spaCy NER – look for PERSON entities that look like titles
        # (spaCy sometimes tags job titles as PERSON or ORG in certain contexts)
        if _nlp and len(text) < 100000:
            doc = _nlp(text[:10000])  # limit for performance
            for ent in doc.ents:
                if ent.label_ in ("PERSON", "ORG"):
                    ent_lower = ent.text.lower()
                    for pattern in _TITLE_PATTERNS:
                        if pattern.search(ent_lower):
                            titles.add(ent.text.strip().title())

        return sorted(titles)

    def _detect_seniority(self, job_titles, total_years):
        """Determine seniority from job titles and experience duration."""
        best_seniority = None
        best_score = -1

        for title in job_titles:
            title_lower = title.lower()
            for keyword, level in _SENIORITY_MAP.items():
                if keyword in title_lower:
                    level_score = _SENIORITY_SCORES.get(level, 0)
                    if level_score > best_score:
                        best_seniority = level
                        best_score = level_score

        # Fallback: infer from years if no title-based signal
        if best_seniority is None:
            if total_years >= 10:
                best_seniority = "lead"
            elif total_years >= 6:
                best_seniority = "senior"
            elif total_years >= 3:
                best_seniority = "mid"
            elif total_years >= 1:
                best_seniority = "junior"
            else:
                best_seniority = "intern"

        return best_seniority

    def _compute_score(self, total_years, seniority, num_titles):
        """Compute experience score (0-100).

        Blends years of experience (60%) + seniority level (30%) + title diversity (10%).
        """
        # Years component: 0-60 points (caps at 15 years)
        years_score = min(total_years / 15.0, 1.0) * 60

        # Seniority component: 0-30 points
        seniority_score = _SENIORITY_SCORES.get(seniority, 25) / 100.0 * 30

        # Title diversity: 0-10 points (caps at 4 distinct titles)
        title_score = min(num_titles / 4.0, 1.0) * 10

        return years_score + seniority_score + title_score
