import re
from typing import Dict, Any, List, Optional
from backend.app.schemas.form import FormFieldInfo, FormExplainResponse, FormParseResponse
from backend.app.providers.llm.factory import get_llm_provider

# Standard repository of common civic and government form fields with plain explanations
KNOWN_FORM_FIELDS: Dict[str, Dict[str, Any]] = {
    "annual household income": {
        "label": "Annual Household Income (वार्षिक पारिवारिक आय)",
        "type": "number",
        "explanation_hi": "यह आपके पूरे परिवार (माता-पिता, पति/पत्नी, कमाने वाले सदस्य) की एक साल की कुल कमाई है। अपने आधिकारिक आय प्रमाण पत्र (Income Certificate) या ITR से सही राशि देखकर भरें।",
        "explanation_en": "This is the total combined pre-tax income earned by all family members in one full year. Verify with your official Income Certificate or ITR.",
        "example": "जैसे: ₹ 1,80,000",
        "documents": ["आय प्रमाण पत्र (Income Certificate)", "वेतन पर्ची / ITR"],
        "required": True
    },
    "domicile certificate": {
        "label": "Domicile / Residence Certificate (मूल निवास प्रमाण पत्र)",
        "type": "text",
        "explanation_hi": "यह इस बात का सरकारी प्रमाण है कि आप संबंधित राज्य या जिले के स्थायी निवासी हैं।",
        "explanation_en": "An official government document certifying that you are a permanent resident of this state.",
        "example": "प्रमाण पत्र संख्या दर्ज करें, जैसे: DOM/2026/12345",
        "documents": ["मूल निवास प्रमाण पत्र (Domicile Certificate)"],
        "required": True
    },
    "aadhaar number": {
        "label": "Aadhaar Card Number (आधार संख्या)",
        "type": "text",
        "explanation_hi": "यह आपका 12 अंकों का विशिष्ट पहचान नंबर है। अपने आधार कार्ड से देखकर सही 12 अंक दर्ज करें।",
        "explanation_en": "Your unique 12-digit Indian national identity number found on your Aadhaar card.",
        "example": "जैसे: 1234 5678 9012",
        "documents": ["आधार कार्ड (Aadhaar Card)"],
        "required": True
    },
    "bank account number": {
        "label": "Bank Account Number (बैंक खाता संख्या)",
        "type": "text",
        "explanation_hi": "सरकारी सब्सिडी या योजना की राशि इसी खाते में आएगी। अपनी बैंक पासबुक के पहले पन्ने से खाता संख्या और IFSC कोड देखकर भरें।",
        "explanation_en": "The bank account where subsidies or DBT benefits will be deposited. Refer directly to your bank passbook or cancelled cheque.",
        "example": "जैसे: 30129482910 (और IFSC: SBIN0001234)",
        "documents": ["बैंक पासबुक (Bank Passbook)", "रद्द चेक (Cancelled Cheque)"],
        "required": True
    },
    "category": {
        "label": "Social Category / Caste (श्रेणी / जाति)",
        "type": "select",
        "explanation_hi": "यह आपकी आरक्षण श्रेणी (General, OBC, SC, ST, EWS) है। यदि आरक्षित वर्ग चुनते हैं, तो जाति प्रमाण पत्र संलग्न करना अनिवार्य होगा।",
        "explanation_en": "Your reservation category (General, OBC, SC, ST, EWS). Reserved categories require a valid Caste Certificate.",
        "example": "विकल्प चुनें: General / OBC / SC / ST / EWS",
        "documents": ["जाति प्रमाण पत्र (Caste Certificate, यदि लागू हो)"],
        "required": True
    }
}

class FormService:
    def __init__(self):
        self.llm = get_llm_provider()

    def parse_fields_from_text(self, document_id: str, text: str) -> FormParseResponse:
        """Extract detected fields and match against known government / civic form patterns"""
        detected_fields: List[FormFieldInfo] = []
        lower_text = text.lower()

        # Match against our known dictionary
        idx = 1
        for key, info in KNOWN_FORM_FIELDS.items():
            if key in lower_text or any(w in lower_text for w in key.split()):
                detected_fields.append(FormFieldInfo(
                    field_id=f"f_{idx}",
                    label=info["label"],
                    field_type=info["type"],
                    explanation_hi=info["explanation_hi"],
                    explanation_en=info["explanation_en"],
                    example=info["example"],
                    required=info["required"],
                    source_citation="फॉर्म अनुभाग एवं नियम नियमावली"
                ))
                idx += 1

        # If none matched directly from raw text, provide standard standard civic onboarding fields
        if not detected_fields:
            for key in ["aadhaar number", "annual household income", "bank account number"]:
                info = KNOWN_FORM_FIELDS[key]
                detected_fields.append(FormFieldInfo(
                    field_id=f"f_{idx}",
                    label=info["label"],
                    field_type=info["type"],
                    explanation_hi=info["explanation_hi"],
                    explanation_en=info["explanation_en"],
                    example=info["example"],
                    required=info["required"],
                    source_citation="सामान्य आवेदन फॉर्म प्रपत्र"
                ))
                idx += 1

        return FormParseResponse(
            document_id=document_id,
            form_title="नागरिक आवेदन प्रपत्र (Citizen Application Form)",
            fields=detected_fields,
            total_fields=len(detected_fields)
        )

    async def explain_field(self, field_label: str, context: Optional[str] = None, language: str = "hi") -> FormExplainResponse:
        lower = field_label.lower()
        matched_info = None
        for k, v in KNOWN_FORM_FIELDS.items():
            if k in lower:
                matched_info = v
                break

        if matched_info:
            explanation = matched_info["explanation_hi"] if language == "hi" else matched_info["explanation_en"]
            example = matched_info["example"]
            docs = matched_info["documents"]
        else:
            prompt = (
                f"Explain what this form field means in simple words for a rural or elderly citizen: '{field_label}'.\n"
                f"Give a clear, practical example and state what official document they should look at.\n"
                f"Respond in {'Hindi' if language == 'hi' else 'English'}."
            )
            raw = await self.llm.generate_response(prompt)
            explanation = raw
            example = "दस्तावेज़ देखकर सही मूल्य दर्ज करें।" if language == "hi" else "Refer directly to your document."
            docs = ["आधिकारिक पहचान पत्र (Official ID)"]

        safety_note = (
            "सावधानी: यह केवल समझाने के लिए मार्गदर्शन है। डिजिटल साथी कोई भी फॉर्म आधिकारिक रूप से खुद जमा नहीं करता है।"
            if language == "hi" else
            "Safety Notice: This guidance is for informational assistance. Digital Saathi does not automatically submit official forms."
        )

        return FormExplainResponse(
            field_label=field_label,
            simple_explanation=explanation,
            practical_example=example,
            required_documents_hint=docs,
            safety_note=safety_note,
            language=language
        )

form_service = FormService()
