import fitz  # PyMuPDF
import pdfplumber
import io


class PDFExtractor:
    """Extract text content from PDF files.

    Uses PyMuPDF as the primary extraction engine for speed and accuracy,
    with pdfplumber as a fallback for scanned or complex-layout PDFs.
    """

    def extract(self, file_bytes):
        """Extract text from PDF bytes. Try PyMuPDF first, fallback to pdfplumber."""
        text = self._extract_pymupdf(file_bytes)
        if not text or len(text.strip()) < 50:
            text = self._extract_pdfplumber(file_bytes)
        return text

    def _extract_pymupdf(self, file_bytes):
        """Primary extraction using PyMuPDF (fast, handles most PDFs well)."""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception:
            return ""

    def _extract_pdfplumber(self, file_bytes):
        """Fallback extraction using pdfplumber (better for table-heavy layouts)."""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception:
            return ""
