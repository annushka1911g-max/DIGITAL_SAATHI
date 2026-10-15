import re
from backend.app.providers.llm.base import BaseLLMProvider
from backend.app.core.logging import logger

class DemoLLMProvider(BaseLLMProvider):
    """
    Deterministic & Rule-grounded local LLM provider for zero-secret development,
    demonstration, and evaluation. Clearly labels all outputs.
    """
    def get_provider_name(self) -> str:
        return "Digital Saathi Local Assistant Engine (Demo Mode)"

    async def generate_response(self, prompt: str, system_prompt: str = "", temperature: float = 0.3) -> str:
        p_lower = prompt.lower()

        # Check for language
        is_hindi = bool(re.search(r'[\u0900-\u097F]', prompt)) or any(w in p_lower for w in ["kya", "kaise", "madad", "batao", "namaste", "sahayata"])

        # Document summary or Q&A
        if "document context:" in p_lower or "दस्तावेज़" in prompt or "summarize" in p_lower:
            if is_hindi:
                return (
                    "यह दस्तावेज़ एक महत्वपूर्ण आधिकारिक सूचना है।\n"
                    "मुख्य बिंदु:\n"
                    "1. इसमें नियत तारीख (Due Date) और जरूरी शुल्क/राशि का विवरण दिया गया है।\n"
                    "2. आपको निर्धारित समय सीमा से पहले आवश्यक प्रमाण-पत्र संलग्न करने होंगे।\n"
                    "3. यदि कोई विसंगति दिखे तो संबंधित विभाग के आधिकारिक हेल्पलाइन नंबर पर संपर्क करें।"
                )
            else:
                return (
                    "This document contains important official instructions.\n"
                    "Key Takeaways:\n"
                    "1. Outlines relevant deadlines, required fees or account details.\n"
                    "2. Highlights necessary verification documents needed for processing.\n"
                    "3. Recommends contacting the official department directly if discrepancies arise."
                )

        # Form explanation
        if "form" in p_lower or "फॉर्म" in prompt or "annual household income" in p_lower:
            if is_hindi:
                return (
                    "यह फॉर्म संबंधित विभाग के सत्यापन के लिए है। "
                    "कृपया अपने आधार कार्ड अथवा आय प्रमाण पत्र से सही विवरण देखकर ही भरें। "
                    "अंदाजे से कोई भी गलत जानकारी दर्ज न करें।"
                )
            else:
                return (
                    "This form field requires official verification details. "
                    "Please refer directly to your identity or income documents before entering the value. "
                    "Do not enter estimated numbers."
                )

        # Scam check
        if "bank" in p_lower or "otp" in p_lower or "block" in p_lower or "lottery" in p_lower or "link" in p_lower:
            if is_hindi:
                return (
                    "सावधानी: यह संदेश संदिग्ध और धोखाधड़ी (Scam) वाला प्रतीत होता है। "
                    "कोई भी बैंक कभी भी एसएमएस या कॉल पर आपका ओटीपी या पासवर्ड नहीं मांगता। "
                    "दिए गए लिंक पर क्लिक न करें।"
                )
            else:
                return (
                    "Caution: This message exhibits high-risk phishing and scam indicators. "
                    "Official banks never ask for OTPs or login PINs via SMS or third-party links. "
                    "Do not click on links."
                )

        # General conversational response
        if is_hindi:
            return (
                "नमस्ते! मैं आपका डिजिटल साथी हूँ। "
                "मैं आपको सरकारी फॉर्म समझने, दस्तावेज़ पढ़ने, संदिग्ध संदेशों की जाँच करने "
                "और रोज़मर्रा की डिजिटल समस्याओं को आसान भाषा में सुलझाने में मदद कर सकता हूँ। "
                "आप मुझसे कुछ भी बोलकर या लिखकर पूछ सकते हैं।"
            )
        else:
            return (
                "Hello! I am your Digital Saathi. "
                "I am here to help you understand complex forms, summarize documents, "
                "check suspicious messages or links, and navigate digital services safely in simple language. "
                "Feel free to speak or type your question."
            )
