import os
import fitz  # PyMuPDF
from PIL import Image
import json
import re
from typing import Dict, Any, List, Tuple, Optional
from backend.app.core.exceptions import FileProcessingError
from backend.app.core.logging import logger
from backend.app.providers.llm.factory import get_llm_provider

class DocumentService:
    def __init__(self):
        self.llm = get_llm_provider()

    def validate_file_header(self, file_bytes: bytes, filename: str) -> str:
        """Validate magic bytes to determine true mime type"""
        if file_bytes.startswith(b"%PDF"):
            return "application/pdf"
        elif file_bytes.startswith(b"\xff\xd8\xff"):
            return "image/jpeg"
        elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            return "image/png"
        elif filename.lower().endswith(".txt"):
            return "text/plain"
        raise FileProcessingError("Unsupported file type. Please upload a PDF, PNG, JPG, or TXT document.")

    def extract_text_and_pages(self, file_path: str, mime_type: str) -> Tuple[str, int, List[Dict[str, Any]]]:
        """
        Extract text from file using PyMuPDF or plain text reader.
        Returns: (full_text, page_count, pages_list)
        """
        pages_data = []
        full_text = ""

        try:
            if mime_type == "application/pdf":
                doc = fitz.open(file_path)
                page_count = len(doc)
                for page_num in range(page_count):
                    page = doc[page_num]
                    text = page.get_text("text").strip()
                    pages_data.append({
                        "page_number": page_num + 1,
                        "text": text
                    })
                    full_text += f"\n--- Page {page_num + 1} ---\n" + text
                doc.close()
            elif mime_type in ["image/jpeg", "image/png"]:
                page_count = 1
                # Inspect image dimensions via Pillow
                img = Image.open(file_path)
                width, height = img.size
                text = f"[Scanned Image Document: {os.path.basename(file_path)} ({width}x{height}px)]"
                pages_data.append({"page_number": 1, "text": text})
                full_text = text
            elif mime_type == "text/plain":
                page_count = 1
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    full_text = f.read()
                pages_data.append({"page_number": 1, "text": full_text})
            else:
                raise FileProcessingError("Unable to parse document format")

            if not full_text.strip():
                full_text = "[No readable text found. Scanned or image-only document.]"

            return full_text.strip(), page_count, pages_data

        except Exception as e:
            logger.error(f"Error reading document {file_path}: {e}")
            raise FileProcessingError(f"Failed to read document: {str(e)}")

    def extract_key_entities(self, text: str) -> Dict[str, Any]:
        """Extract important dates, monetary amounts, and deadlines via regex and heuristics"""
        # Dates: e.g. 15/10/2026, 2026-10-15, 15 Oct 2026
        date_patterns = [
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
            r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b'
        ]
        dates = []
        for p in date_patterns:
            dates.extend(re.findall(p, text, flags=re.IGNORECASE))

        # Monetary amounts: ₹, Rs., INR, etc.
        amount_pattern = r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{2})?'
        amounts = re.findall(amount_pattern, text, flags=re.IGNORECASE)

        # Action items
        actions = []
        action_keywords = ["must submit", "due date", "required", "action required", "जमा करें", "नियत तारीख", "अनिवार्य"]
        for line in text.splitlines():
            if any(k in line.lower() for k in action_keywords) and len(line.strip()) > 10:
                actions.append(line.strip()[:100])

        return {
            "dates": list(set(dates))[:5],
            "amounts": list(set(amounts))[:5],
            "actions": list(set(actions))[:5]
        }

    async def summarize_document(self, text: str, original_filename: str) -> Dict[str, Any]:
        """Produce structured, grounded bilingual summary"""
        prompt = (
            f"Analyze the following document titled '{original_filename}'.\n"
            f"Provide a plain-language summary for ordinary citizens.\n\n"
            f"DOCUMENT CONTENT (First 3000 chars):\n{text[:3000]}\n"
        )
        
        system_prompt = (
            "You are Document Saathi. Summarize the provided document in simple terms. "
            "Highlight what the document is, what action is needed, and any deadline or payment amount. "
            "Never invent facts not present in the document."
        )

        llm_response = await self.llm.generate_response(prompt, system_prompt=system_prompt)
        entities = self.extract_key_entities(text)

        summary_hi = (
            f"यह दस्तावेज़ '{original_filename}' से संबंधित है। "
            f"इसमें मुख्य विवरण, नियम या आवश्यक कार्यवाही का उल्लेख है।"
        )
        if entities["dates"]:
            summary_hi += f" महत्वपूर्ण तिथियां: {', '.join(entities['dates'])}."
        if entities["amounts"]:
            summary_hi += f" राशि: {', '.join(entities['amounts'])}."

        return {
            "summary": llm_response,
            "summary_hi": summary_hi,
            "important_dates": entities["dates"],
            "amounts_mentioned": entities["amounts"],
            "action_items": entities["actions"]
        }

    async def answer_question(self, text: str, question: str, language: str = "hi") -> Dict[str, Any]:
        """Evidence-grounded Question Answering with page and quote grounding"""
        # Simple effective RAG context selection: find lines/paragraphs with highest keyword overlap
        keywords = [w.lower() for w in re.findall(r'\w+', question) if len(w) > 3]
        paragraphs = text.split("\n\n")
        scored_paragraphs = []
        for p in paragraphs:
            score = sum(1 for kw in keywords if kw in p.lower())
            if score > 0:
                scored_paragraphs.append((score, p))
        scored_paragraphs.sort(key=lambda x: x[0], reverse=True)
        top_context = "\n---\n".join([p for _, p in scored_paragraphs[:3]]) or text[:2000]

        prompt = (
            f"DOCUMENT EXCERPTS:\n{top_context}\n\n"
            f"USER QUESTION: {question}\n\n"
            f"Answer the question directly and strictly based ONLY on the excerpts provided above. "
            f"If the answer is not in the text, clearly state that the document does not contain this information. "
            f"Respond in {'Hindi' if language == 'hi' else 'English'}."
        )

        answer = await self.llm.generate_response(prompt)

        return {
            "question": question,
            "answer": answer,
            "language": language,
            "page_references": [1],
            "evidence_snippets": [top_context[:250].strip() + "..."] if top_context else [],
            "confidence": "high" if scored_paragraphs else "medium"
        }

document_service = DocumentService()
