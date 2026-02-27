import re


class TextPreprocessor:
    """Regex-based text preprocessing for resume content.

    Provides lightweight cleaning, tokenization, and section detection
    without heavy NLP dependencies like spaCy.
    """

    # Common resume section headings (case-insensitive matching)
    SECTION_PATTERNS = {
        "education": re.compile(
            r"(?:^|\n)\s*(?:education|academic\s+background|qualifications|"
            r"academic\s+qualifications|degrees?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "experience": re.compile(
            r"(?:^|\n)\s*(?:(?:work\s+)?experience|employment\s+history|"
            r"professional\s+experience|work\s+history|career\s+history)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "skills": re.compile(
            r"(?:^|\n)\s*(?:(?:technical\s+)?skills|core\s+competenc(?:ies|e)|"
            r"areas?\s+of\s+expertise|proficienc(?:ies|y)|technical\s+proficiency)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "summary": re.compile(
            r"(?:^|\n)\s*(?:summary|professional\s+summary|profile|"
            r"objective|career\s+objective|about\s+me|overview)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "projects": re.compile(
            r"(?:^|\n)\s*(?:projects|personal\s+projects|"
            r"academic\s+projects|key\s+projects)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "certifications": re.compile(
            r"(?:^|\n)\s*(?:certifications?|licenses?\s*(?:&|and)?\s*certifications?|"
            r"professional\s+certifications?|accreditations?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "awards": re.compile(
            r"(?:^|\n)\s*(?:awards?|honors?|achievements?|"
            r"awards?\s*(?:&|and)?\s*honors?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "publications": re.compile(
            r"(?:^|\n)\s*(?:publications?|research|papers?|"
            r"published\s+works?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "languages": re.compile(
            r"(?:^|\n)\s*(?:languages?|language\s+skills?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "interests": re.compile(
            r"(?:^|\n)\s*(?:interests?|hobbies|"
            r"hobbies?\s*(?:&|and)?\s*interests?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "references": re.compile(
            r"(?:^|\n)\s*(?:references?|referees?)\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
        "volunteer": re.compile(
            r"(?:^|\n)\s*(?:volunteer(?:ing)?|community\s+(?:service|involvement))\s*[:\-—]?\s*\n",
            re.IGNORECASE,
        ),
    }

    def clean_text(self, text):
        """Lowercase, remove special characters, and normalize whitespace.

        Preserves alphanumeric characters, basic punctuation needed for
        meaningful text analysis, and common separators.
        """
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower()

        # Replace common unicode characters with ASCII equivalents
        replacements = {
            "\u2018": "'", "\u2019": "'",  # smart single quotes
            "\u201c": '"', "\u201d": '"',  # smart double quotes
            "\u2013": "-", "\u2014": "-",  # en-dash, em-dash
            "\u2026": "...",               # ellipsis
            "\u00a0": " ",                 # non-breaking space
            "\u2022": " ",                 # bullet
            "\u25cf": " ",                 # black circle
            "\u25cb": " ",                 # white circle
            "\u00b7": " ",                 # middle dot
        }
        for old, new in replacements.items():
            text = text.replace(old, new)

        # Remove non-printable / control characters (keep newlines and tabs)
        text = re.sub(r"[^\x20-\x7E\n\t]", " ", text)

        # Remove special characters but keep letters, digits, common punctuation
        text = re.sub(r"[^a-z0-9\s\.\,\;\:\-\+\#\/\(\)\&\'\"]", " ", text)

        # Normalize whitespace: collapse multiple spaces/tabs into one
        text = re.sub(r"[ \t]+", " ", text)

        # Normalize multiple newlines into at most two
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Strip leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines)

        return text.strip()

    def tokenize(self, text):
        """Simple word tokenization using regex.

        Splits on whitespace and punctuation boundaries, filters out
        tokens shorter than 2 characters and pure numeric tokens.
        """
        if not text:
            return []

        # Split on non-alphanumeric characters (keep + and # for C++, C#, etc.)
        tokens = re.findall(r"[a-zA-Z0-9\+\#]+(?:[\.\-][a-zA-Z0-9\+\#]+)*", text)

        # Filter out very short tokens and purely numeric tokens
        tokens = [
            t.lower()
            for t in tokens
            if len(t) >= 2 and not re.match(r"^\d+$", t)
        ]

        return tokens

    def extract_sections(self, text):
        """Identify and extract common resume sections.

        Attempts to locate section headings (Education, Experience, Skills, etc.)
        and extract the text content beneath each heading until the next heading
        or end of document.

        Returns a dict mapping section name to its text content. Includes a
        special 'header' key for text before the first detected section.
        """
        if not text:
            return {}

        # Find all section heading positions
        section_positions = []
        for section_name, pattern in self.SECTION_PATTERNS.items():
            match = pattern.search(text)
            if match:
                section_positions.append(
                    (match.start(), match.end(), section_name)
                )

        # If no sections found, return the entire text as 'full_text'
        if not section_positions:
            return {"full_text": text.strip()}

        # Sort by position in document
        section_positions.sort(key=lambda x: x[0])

        sections = {}

        # Capture text before the first section as 'header' (often contains name/contact)
        first_section_start = section_positions[0][0]
        header_text = text[:first_section_start].strip()
        if header_text:
            sections["header"] = header_text

        # Extract text for each section
        for i, (start, content_start, name) in enumerate(section_positions):
            # Section content runs from end of heading to start of next section
            if i + 1 < len(section_positions):
                next_section_start = section_positions[i + 1][0]
                section_text = text[content_start:next_section_start].strip()
            else:
                section_text = text[content_start:].strip()

            if section_text:
                sections[name] = section_text

        return sections
