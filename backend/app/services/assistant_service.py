import re
from typing import Optional, Dict, Any, List
from backend.app.providers.llm.factory import get_llm_provider
from backend.app.schemas.assistant import AssistantResponse

class AssistantService:
    def __init__(self):
        self.llm = get_llm_provider()

    def detect_intent(self, text: str) -> str:
        t = text.lower()
        if any(w in t for w in ["scam", "fraud", "dhokhadhadi", "lottery", "otp", "block", "phishing", "fake message", "संदिग्ध"]):
            return "scam_inquiry"
        if any(w in t for w in ["form", "फॉर्म", "आवेदन", "income", "eligibility", "patrata", "column"]):
            return "form_guidance"
        if any(w in t for w in ["document", "दस्तावेज़", "pdf", "file", "summarize", "bill", "bijli", "रसीद", "तारीख"]):
            return "document_query"
        return "general_query"

    def detect_language(self, text: str, user_pref_lang: str = "hi") -> str:
        # Check if text contains Devanagari Unicode range
        if re.search(r'[\u0900-\u097F]', text):
            return "hi"
        # Check for common Hinglish words
        hinglish = ["kya", "kaise", "batao", "madad", "mera", "meri", "namaste", "dhanyawad"]
        if any(w in text.lower().split() for w in hinglish):
            return "hi"
        return user_pref_lang or "hi"

    async def chat(self, message: str, language: Optional[str] = None, user_id: Optional[str] = None) -> AssistantResponse:
        detected_lang = self.detect_language(message, language or "hi")
        intent = self.detect_intent(message)

        system_prompt = (
            f"You are Digital Saathi (डिजिटल साथी), a compassionate and helpful accessibility AI assistant for Indian citizens. "
            f"Respond clearly and concisely in {'Hindi (हिंदी)' if detected_lang == 'hi' else 'simple, plain English'}. "
            f"Avoid technical jargon. Always prioritize user safety and digital privacy. "
            f"If something seems risky or unclear, gently warn the user."
        )

        raw_answer = await self.llm.generate_response(
            prompt=message,
            system_prompt=system_prompt,
            temperature=0.3
        )

        warnings: List[str] = []
        evidence: List[str] = []
        suggested_actions: List[str] = []

        if intent == "scam_inquiry":
            warnings.append("चेतावनी: किसी के साथ ओटीपी (OTP) या बैंक पिन कभी साझा न करें।" if detected_lang == "hi" else "Warning: Never share OTP or bank PIN with anyone.")
            suggested_actions = ["संदेश की जाँच करें (Scan Message)", "साइबर क्राइम पोर्टल (Cybercrime Helpline 1930)"]
        elif intent == "form_guidance":
            evidence.append("सामान्य फॉर्म दिशा-निर्देश (General form assistance)")
            suggested_actions = ["फॉर्म अपलोड करें (Upload Form)", "दस्तावेज़ सूची देखें (Checklist)"]
        elif intent == "document_query":
            suggested_actions = ["दस्तावेज़ अपलोड करें (Upload Document)", "महत्वपूर्ण तिथियां देखें (View Dates)"]
        else:
            suggested_actions = ["आवाज़ से पूछें (Ask by Voice)", "दस्तावेज़ समझें (Read Document)", "संदेश जाँचें (Check Message)"]

        return AssistantResponse(
            answer=raw_answer,
            language=detected_lang,
            intent=intent,
            evidence=evidence,
            warnings=warnings,
            requires_confirmation=False,
            suggested_actions=suggested_actions
        )

assistant_service = AssistantService()
