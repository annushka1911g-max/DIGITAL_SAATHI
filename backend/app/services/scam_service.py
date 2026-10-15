import re
from typing import Dict, Any, List
from backend.app.schemas.scam import WarningSign, ScamAnalyzeResponse
from backend.app.providers.llm.factory import get_llm_provider

class ScamService:
    def __init__(self):
        self.llm = get_llm_provider()

    def analyze_message(self, message: str, language: str = "hi") -> Dict[str, Any]:
        """
        Deterministic + heuristic rule engine for suspicious message analysis.
        Calibrates risk score based on presence of specific threat vectors.
        """
        text = message.strip()
        lower_text = text.lower()

        warning_signs: List[WarningSign] = []
        score = 0  # 0 to 100 risk score

        # 1. Credential & OTP harvesting
        otp_patterns = [r'\botp\b', r'\bpin\b', r'\bpassword\b', r'\bcvv\b', r'ओटीपी', r'पिन', r'पासवर्ड']
        if any(re.search(p, lower_text) for p in otp_patterns):
            score += 45
            warning_signs.append(WarningSign(
                title="गोपनीय जानकारी (OTP/PIN) की मांग" if language == "hi" else "Request for Sensitive Credentials (OTP/PIN)",
                description="संदेश में पासवर्ड या OTP मांगा जा रहा है। कोई भी वैध बैंक या सरकारी एजेंसी कभी OTP नहीं मांगती।" if language == "hi" else "The message asks for an OTP or PIN. Legitimate banks and government bodies NEVER request OTPs.",
                severity="critical"
            ))

        # 2. Urgency & Threats (Immediate blocking, penalty, legal action)
        urgency_patterns = [
            r'block(?:ed)?\b', r'suspend(?:ed)?\b', r'immediately\b', r'within 24 hours\b',
            r'today\b', r'deactivat\w*', r'बिजली कट\w*', r'खाता बंद', r'अकाउंट ब्लॉक', r'तुरंत'
        ]
        if any(re.search(p, lower_text) for p in urgency_patterns):
            score += 30
            warning_signs.append(WarningSign(
                title="अत्यधिक तात्कालिकता या डराने की भाषा" if language == "hi" else "Artificial Urgency & Coercive Threats",
                description="संदेश भय पैदा करने की कोशिश कर रहा है (जैसे 'खाता आज बंद हो जाएगा') ताकि आप बिना सोचे निर्णय लें।" if language == "hi" else "Creates artificial urgency or fear (e.g. 'account blocked today') to prevent critical thinking.",
                severity="medium"
            ))

        # 3. Suspicious Links or Shorteners
        url_pattern = r'https?://[^\s]+|(?:bit\.ly|tinyurl\.com|t\.co|ngrok|is\.gd|cutt\.ly|rb\.gy)/[^\s]+'
        urls_found = re.findall(url_pattern, text, flags=re.IGNORECASE)
        suspicious_domains = [".xyz", ".top", ".club", ".apk", ".link", ".live", "ngrok", "bit.ly", "tinyurl"]
        
        has_suspicious_url = False
        if urls_found:
            for u in urls_found:
                if any(bad in u.lower() for bad in suspicious_domains) or not any(gov in u.lower() for gov in [".gov.in", ".nic.in", ".ac.in", ".org"]):
                    has_suspicious_url = True
            
            score += 35 if has_suspicious_url else 20
            warning_signs.append(WarningSign(
                title="संदिग्ध लिंक या अनधिकृत वेबसाइट" if language == "hi" else "Suspicious Web Link / Unverified URL",
                description="संदेश में दिया गया लिंक आधिकारिक वेबसाइट जैसा नहीं लगता। इसमें फ़िशिंग का खतरा है।" if language == "hi" else "The link directs to an unofficial or suspicious domain posing phishing risks.",
                severity="critical" if has_suspicious_url else "medium"
            ))

        # 4. Impersonation of Banks or Electricity Board or Lottery
        impersonation_keywords = [
            "sbi", "hdfc", "icici", "pnb", "paytm", "electricity bill", "lottery",
            "kbc", "income tax refund", "gift card", "जीतें", "लॉटरी", "बिजली बिल"
        ]
        if any(kw in lower_text for kw in impersonation_keywords):
            score += 20
            warning_signs.append(WarningSign(
                title="बैंक/संस्थान के नाम का अनुचित उपयोग" if language == "hi" else "Brand / Official Entity Impersonation",
                description="संदेश किसी बड़े बैंक या सरकारी योजना के नाम पर भेजा गया लगता है।" if language == "hi" else "Purports to represent a recognized bank, utility board, or lottery organization.",
                severity="medium"
            ))

        # 5. Determine Risk Level & Calibrated Confidence
        if score >= 60:
            risk_level = "High"
            confidence_score = min(0.95, 0.70 + (score / 300.0))
            simple_explanation = (
                "यह संदेश अत्यधिक संदिग्ध और धोखाधड़ी (Scam) वाला है! इसमें डर पैदा करके या लालच देकर आपका पैसा या पासवर्ड चुराने का प्रयास किया गया है।"
                if language == "hi" else
                "This message exhibits critical phishing and fraud indicators. It appears engineered to compromise your financial accounts or steal credentials."
            )
        elif score >= 25:
            risk_level = "Medium"
            confidence_score = 0.75
            simple_explanation = (
                "इस संदेश में कुछ संदिग्ध संकेत मिले हैं। किसी भी अज्ञात लिंक पर क्लिक करने या विवरण देने से पहले सावधानी बरतें।"
                if language == "hi" else
                "This message displays potential warning signs. Exercise caution before interacting with any links or senders."
            )
        else:
            risk_level = "Low"
            confidence_score = 0.70
            simple_explanation = (
                "इस संदेश में कोई स्पष्ट धोखाधड़ी संकेत नहीं मिले हैं। फिर भी, किसी भी अज्ञात व्यक्ति को निजी जानकारी कभी न दें।"
                if language == "hi" else
                "No overt scam indicators were detected in this sample. However, remain vigilant and never share private credentials with unknown parties."
            )

        # 6. Actionable recommendations
        if risk_level in ["High", "Medium"]:
            recommended_actions = [
                "संदेश में दिए गए किसी भी लिंक पर कभी क्लिक न करें।" if language == "hi" else "Do not click on any links in the message.",
                "ओटीपी, बैंक पिन या पासवर्ड किसी को न बताएं।" if language == "hi" else "Never share OTPs, PINs, or card passwords.",
                "यदि बैंक का संदेश है, तो अपनी आधिकारिक बैंक शाखा या मोबाइल ऐप से सीधे जांचें।" if language == "hi" else "Verify directly with your bank branch or official banking app.",
                "संदेश भेजने वाले नंबर को तुरंत ब्लॉक और रिपोर्ट करें।" if language == "hi" else "Block the sender and report the message."
            ]
        else:
            recommended_actions = [
                "अपरिचित प्रेषकों से प्राप्त किसी भी लिंक पर सतर्क रहें।" if language == "hi" else "Remain cautious with links from unknown contacts.",
                "सत्यापित संचार चैनलों का ही उपयोग करें।" if language == "hi" else "Always use official communication channels."
            ]

        official_links = [
            "https://www.cybercrime.gov.in (National Cyber Crime Reporting Portal)",
            "हेल्पलाइन नंबर: 1930 (Toll-Free National Cyber Financial Fraud Helpline)",
            "https://sancharsaathi.gov.in (Chakshu - Report Suspected Fraud Communication)"
        ]

        return {
            "risk_level": risk_level,
            "confidence_score": round(confidence_score, 2),
            "detected_warning_signs": warning_signs,
            "simple_explanation": simple_explanation,
            "recommended_actions": recommended_actions,
            "official_reporting_links": official_links,
            "language": language
        }

scam_service = ScamService()
