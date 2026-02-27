from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class TFIDFEngine:
    """TF-IDF + cosine similarity engine for comparing resume text to job descriptions."""

    # Section repetition factors – repeating section text before vectorisation
    # gives it proportionally more weight in the TF-IDF vector.
    SECTION_REPEAT = {
        "experience": 2,
        "skills": 1,  # extra 1x repetition (so effectively 1.5x via half-repeat below)
    }

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=5000,
            stop_words='english'
        )

    def compute_similarity(self, resume_text, job_description, sections=None):
        """Compute TF-IDF cosine similarity between resume and job description.

        Args:
            resume_text: The full text extracted from the candidate's resume.
            job_description: The text of the job role description.
            sections: Optional dict of section_name -> section_text. When
                provided, experience and skills sections are weighted higher
                in the TF-IDF vector.

        Returns:
            A float between 0.0 and 1.0 representing cosine similarity,
            or 0.0 if computation fails.
        """
        try:
            if not resume_text or not job_description:
                return 0.0

            if not resume_text.strip() or not job_description.strip():
                return 0.0

            weighted_resume = self._build_weighted_text(resume_text, sections)

            tfidf_matrix = self.vectorizer.fit_transform([weighted_resume, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception:
            return 0.0

    def _build_weighted_text(self, resume_text, sections):
        """Concatenate resume text with extra repetitions of key sections.

        If *sections* is provided, the experience section text is appended
        an extra 2 times and the skills section text 1 extra time, so that
        terms appearing in those sections have disproportionately higher
        TF values.
        """
        if not sections:
            return resume_text

        parts = [resume_text]

        experience_text = sections.get("experience", "")
        if experience_text:
            # Repeat experience section 2 extra times
            parts.extend([experience_text] * self.SECTION_REPEAT.get("experience", 0))

        skills_text = sections.get("skills", "")
        if skills_text:
            # Repeat skills section 1 extra time
            parts.extend([skills_text] * self.SECTION_REPEAT.get("skills", 0))

        return " ".join(parts)
