import json
import os
import re

try:
    from rapidfuzz import fuzz, process as rfprocess
    _HAS_RAPIDFUZZ = True
except ImportError:
    _HAS_RAPIDFUZZ = False


class SkillExtractor:
    """Extract skills from resume text using dictionary-based matching.

    Loads a skills database and matches skill names and aliases against
    the input text. Supports multi-word skills and case-insensitive matching.
    Now also supports fuzzy matching (rapidfuzz) and section-aware extraction.
    """

    FUZZY_THRESHOLD = 85  # minimum rapidfuzz score to accept a fuzzy match

    def __init__(self, skills_db_path=None):
        """Initialize with skills database.

        Args:
            skills_db_path: Path to skills_database.json. If None, uses the
                default path relative to this file's location.
        """
        if skills_db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            skills_db_path = os.path.join(base_dir, "data", "skills_database.json")

        self.skills_db = self._load_skills_db(skills_db_path)
        self._build_lookup()

    def _load_skills_db(self, path):
        """Load skills database from JSON file."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not load skills database from {path}: {e}")
            return []

    def _build_lookup(self):
        """Build lookup structures for efficient matching.

        Creates two dictionaries:
        - _exact_lookup: maps lowercased skill name -> skill entry
        - _alias_lookup: maps lowercased alias -> skill entry

        Each entry is pre-compiled with a word-boundary regex for accurate matching.
        Also builds a list of all known skill names for fuzzy matching.
        """
        self._exact_lookup = {}
        self._alias_lookup = {}
        self._all_skill_names = []  # for fuzzy matching
        self._name_to_skill = {}    # canonical lowercase name -> skill dict

        for skill in self.skills_db:
            name_lower = skill["name"].lower()
            self._exact_lookup[name_lower] = {
                "skill": skill,
                "pattern": self._build_pattern(skill["name"]),
            }
            self._all_skill_names.append(skill["name"])
            self._name_to_skill[name_lower] = skill

            for alias in skill.get("aliases", []):
                alias_lower = alias.lower()
                if alias_lower and alias_lower not in self._alias_lookup:
                    self._alias_lookup[alias_lower] = {
                        "skill": skill,
                        "pattern": self._build_pattern(alias),
                    }

    def _build_pattern(self, term):
        """Build a word-boundary regex pattern for a skill term.

        Handles special characters in skill names like C++, C#, .NET,
        Node.js, etc.
        """
        escaped = re.escape(term)
        # Use word boundaries but handle terms that start/end with
        # non-word characters (e.g., .NET, C++, C#)
        pattern = r"(?<![a-zA-Z0-9])" + escaped + r"(?![a-zA-Z0-9])"
        return re.compile(pattern, re.IGNORECASE)

    def extract(self, text, sections=None):
        """Extract skills from the given text.

        Args:
            text: The resume text to search for skills.
            sections: Optional dict of section_name -> section_text. When
                provided, extraction runs per-section so that downstream
                consumers can apply section-based weighting.

        Returns:
            A list of dicts, each with keys:
                - name (str): The canonical skill name
                - category (str): The skill category
                - confidence (float): 1.0 for exact, 0.8 for alias, ~0.6 for fuzzy
                - sections (list[str]): Section names where the skill was found
                    (only present when *sections* arg is provided)
        """
        if not text:
            return []

        found_skills = {}  # skill_name -> {name, category, confidence, sections}

        # --- Run extraction on full text (primary) ---
        self._extract_from_text(text, found_skills)

        # --- If sections provided, also record which sections each skill appears in ---
        if sections:
            for section_name, section_text in sections.items():
                if not section_text:
                    continue
                for skill_name in list(found_skills.keys()):
                    entry = self._exact_lookup.get(skill_name.lower())
                    if entry and entry["pattern"].search(section_text):
                        found_skills[skill_name].setdefault("sections", [])
                        if section_name not in found_skills[skill_name]["sections"]:
                            found_skills[skill_name]["sections"].append(section_name)
                        continue
                    # Check aliases too
                    for alias_lower, alias_entry in self._alias_lookup.items():
                        if alias_entry["skill"]["name"] == skill_name:
                            if alias_entry["pattern"].search(section_text):
                                found_skills[skill_name].setdefault("sections", [])
                                if section_name not in found_skills[skill_name]["sections"]:
                                    found_skills[skill_name]["sections"].append(section_name)
                                break

        # Sort by confidence descending, then alphabetically
        results = sorted(
            found_skills.values(),
            key=lambda x: (-x["confidence"], x["name"]),
        )

        return results

    def _extract_from_text(self, text, found_skills):
        """Run the three-pass extraction on a single text block.

        Pass 1: Exact name matches (confidence 1.0)
        Pass 2: Alias matches (confidence 0.8)
        Pass 3: Fuzzy matches via rapidfuzz (confidence ~0.6)
        """
        # First pass: exact name matches (highest confidence)
        for name_lower, entry in self._exact_lookup.items():
            if entry["pattern"].search(text):
                skill = entry["skill"]
                skill_name = skill["name"]
                if skill_name not in found_skills:
                    found_skills[skill_name] = {
                        "name": skill_name,
                        "category": skill["category"],
                        "confidence": 1.0,
                    }

        # Second pass: alias matches (lower confidence, only if not already found)
        for alias_lower, entry in self._alias_lookup.items():
            skill = entry["skill"]
            skill_name = skill["name"]
            if skill_name not in found_skills:
                if entry["pattern"].search(text):
                    found_skills[skill_name] = {
                        "name": skill_name,
                        "category": skill["category"],
                        "confidence": 0.8,
                    }

        # Third pass: fuzzy matching against words/phrases in the text
        if _HAS_RAPIDFUZZ and self._all_skill_names:
            self._fuzzy_match(text, found_skills)

    def _fuzzy_match(self, text, found_skills):
        """Use rapidfuzz to find approximate skill name matches in the text.

        Extracts candidate tokens (1-3 word n-grams) from the text and
        compares each against the skill database using token_sort_ratio.
        Only matches scoring >= FUZZY_THRESHOLD that aren't already found
        are added with capped confidence.
        """
        already_found = {name.lower() for name in found_skills}

        # Build candidate n-grams from the text (1, 2, and 3-word)
        words = re.findall(r"[a-zA-Z0-9#+.]+", text)
        candidates = set()
        for i in range(len(words)):
            for n in range(1, 4):
                if i + n <= len(words):
                    candidate = " ".join(words[i:i + n])
                    if len(candidate) >= 2:
                        candidates.add(candidate)

        # Only try fuzzy matching for skills not already found
        unfound_skills = [
            name for name in self._all_skill_names
            if name.lower() not in already_found
        ]

        if not unfound_skills or not candidates:
            return

        # For each unfound skill, check if any text candidate is a close match
        for skill_name in unfound_skills:
            result = rfprocess.extractOne(
                skill_name,
                candidates,
                scorer=fuzz.token_sort_ratio,
                score_cutoff=self.FUZZY_THRESHOLD,
            )
            if result:
                matched_text, score, *_ = result
                skill = self._name_to_skill.get(skill_name.lower())
                if skill:
                    confidence = round(0.6 * (score / 100), 2)
                    found_skills[skill_name] = {
                        "name": skill_name,
                        "category": skill["category"],
                        "confidence": confidence,
                    }

    def get_skills_database(self):
        """Return the full skills database."""
        return self.skills_db

    def get_categories(self):
        """Return a sorted list of unique skill categories."""
        categories = sorted(set(skill["category"] for skill in self.skills_db))
        return categories
