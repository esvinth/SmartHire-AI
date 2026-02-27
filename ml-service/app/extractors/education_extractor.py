import re

try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
except Exception:
    _nlp = None


# --- Degree patterns and scoring ----------------------------------------------

_DEGREE_PATTERNS = [
    ("phd", re.compile(
        r"\b(?:ph\.?d\.?|doctor(?:ate)?|d\.phil)\b", re.IGNORECASE)),
    ("masters", re.compile(
        r"\b(?:master(?:'?s)?|m\.?s\.?c?\.?|m\.?eng\.?|m\.?b\.?a\.?|m\.?a\.?|m\.?tech)\b", re.IGNORECASE)),
    ("bachelors", re.compile(
        r"\b(?:bachelor(?:'?s)?|b\.?s\.?c?\.?|b\.?eng\.?|b\.?a\.?|b\.?tech|b\.?com)\b", re.IGNORECASE)),
    ("associates", re.compile(
        r"\b(?:associate(?:'?s)?|a\.?s\.?|a\.?a\.?)\b", re.IGNORECASE)),
    ("diploma", re.compile(
        r"\b(?:diploma|certification\s+program|bootcamp|nanodegree)\b", re.IGNORECASE)),
]

_DEGREE_SCORES = {
    "phd": 100,
    "masters": 85,
    "bachelors": 70,
    "associates": 55,
    "diploma": 40,
    "none": 20,
}

# Fields of study relevant to tech/engineering
_RELEVANT_FIELDS = [
    re.compile(r"\b(?:computer\s+science|computing|cs)\b", re.IGNORECASE),
    re.compile(r"\b(?:software\s+engineering)\b", re.IGNORECASE),
    re.compile(r"\b(?:information\s+(?:technology|systems|science))\b", re.IGNORECASE),
    re.compile(r"\b(?:data\s+science|machine\s+learning|artificial\s+intelligence)\b", re.IGNORECASE),
    re.compile(r"\b(?:electrical\s+engineering|electronics)\b", re.IGNORECASE),
    re.compile(r"\b(?:computer\s+engineering)\b", re.IGNORECASE),
    re.compile(r"\b(?:mathematics|statistics|applied\s+math)\b", re.IGNORECASE),
    re.compile(r"\b(?:cyber\s*security|information\s+security)\b", re.IGNORECASE),
    re.compile(r"\b(?:engineering)\b", re.IGNORECASE),
]

_FIELD_PATTERNS = [
    re.compile(
        r"\b(?:computer\s+science|software\s+engineering|information\s+technology|"
        r"data\s+science|electrical\s+engineering|computer\s+engineering|"
        r"information\s+systems|mathematics|statistics|physics|"
        r"mechanical\s+engineering|business\s+administration|"
        r"artificial\s+intelligence|machine\s+learning|"
        r"cyber\s*security|information\s+security|"
        r"applied\s+math(?:ematics)?|economics)\b",
        re.IGNORECASE,
    ),
]

# Certification patterns
_CERTIFICATION_PATTERNS = [
    re.compile(r"\b(AWS\s+Certified\s+[\w\s-]+?)(?:\s*[-–,.\n])", re.IGNORECASE),
    re.compile(r"\b(Google\s+Cloud\s+(?:Professional|Associate)\s+[\w\s-]+?)(?:\s*[-–,.\n])", re.IGNORECASE),
    re.compile(r"\b(Azure\s+(?:Administrator|Developer|Solutions?\s+Architect)[\w\s-]*?)(?:\s*[-–,.\n])", re.IGNORECASE),
    re.compile(r"\b(Certified\s+(?:Kubernetes|Docker|Scrum|Information|Ethical)[\w\s-]*?)(?:\s*[-–,.\n])", re.IGNORECASE),
    re.compile(r"\b(PMP|CISSP|CCNA|CCNP|CEH|CompTIA\s+[\w+]+|ITIL|CKA|CKAD)\b", re.IGNORECASE),
    re.compile(r"\b((?:Oracle|Cisco|Microsoft|Google|Meta|Hashicorp)\s+Certified[\w\s-]*?)(?:\s*[-–,.\n])", re.IGNORECASE),
]


class EducationExtractor:
    """Extract education data (degrees, fields, certifications) from resume text."""

    def extract(self, text, sections=None):
        """Extract education information from resume text.

        Args:
            text: Full resume text.
            sections: Optional dict of section_name -> section_text.

        Returns:
            Dict with:
                degree (str): Highest degree level detected
                field (str|None): Field of study if detected
                certifications (list[str]): Certification names
                institutions (list[str]): University/institution names
                education_score (float): 0-100 score
        """
        if not text:
            return self._empty_result()

        education_text = text
        if sections:
            # Combine education + certifications sections for broader search
            parts = []
            for key in ("education", "certifications", "header"):
                if key in sections:
                    parts.append(sections[key])
            if parts:
                education_text = "\n".join(parts)

        degree = self._detect_degree(education_text, text)
        field = self._detect_field(education_text, text)
        certifications = self._extract_certifications(text)
        institutions = self._extract_institutions(education_text)

        education_score = self._compute_score(degree, field, certifications)

        return {
            "degree": degree,
            "field": field,
            "certifications": certifications,
            "institutions": institutions,
            "education_score": round(min(education_score, 100.0), 2),
        }

    def _empty_result(self):
        return {
            "degree": "none",
            "field": None,
            "certifications": [],
            "institutions": [],
            "education_score": _DEGREE_SCORES["none"],
        }

    def _detect_degree(self, education_text, full_text):
        """Return the highest degree found in text."""
        # Check education section first, then full text
        for source in [education_text, full_text]:
            for level, pattern in _DEGREE_PATTERNS:
                if pattern.search(source):
                    return level
        return "none"

    def _detect_field(self, education_text, full_text):
        """Detect field of study."""
        for source in [education_text, full_text]:
            for pattern in _FIELD_PATTERNS:
                match = pattern.search(source)
                if match:
                    return match.group(0).strip().title()
        return None

    def _extract_certifications(self, text):
        """Extract professional certifications from text."""
        certs = set()
        for pattern in _CERTIFICATION_PATTERNS:
            for match in pattern.finditer(text):
                cert = match.group(1).strip()
                # Clean up trailing whitespace or partial words
                cert = re.sub(r"\s+", " ", cert).strip()
                if len(cert) > 3:
                    certs.add(cert)
        return sorted(certs)

    def _extract_institutions(self, text):
        """Extract university/institution names using spaCy NER."""
        institutions = set()

        if _nlp and text:
            # Process limited text for performance
            doc = _nlp(text[:10000])
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    name = ent.text.strip()
                    name_lower = name.lower()
                    # Filter for likely educational institutions
                    if any(kw in name_lower for kw in (
                        "university", "college", "institute",
                        "school", "academy", "polytechnic",
                    )):
                        institutions.add(name)

        return sorted(institutions)

    def _is_relevant_field(self, field):
        """Check if the field of study is relevant to tech/engineering."""
        if not field:
            return False
        for pattern in _RELEVANT_FIELDS:
            if pattern.search(field):
                return True
        return False

    def _compute_score(self, degree, field, certifications):
        """Compute education score (0-100).

        Base score from degree level + bonus for relevant field + bonus for certs.
        """
        base = _DEGREE_SCORES.get(degree, _DEGREE_SCORES["none"])

        # +10 for a relevant field of study
        field_bonus = 10 if self._is_relevant_field(field) else 0

        # +5 per certification, max 15
        cert_bonus = min(len(certifications) * 5, 15)

        return base + field_bonus + cert_bonus
