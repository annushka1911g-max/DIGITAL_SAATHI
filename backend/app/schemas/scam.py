from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ScamAnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=5000)
    language: Optional[str] = "hi"

class WarningSign(BaseModel):
    title: str
    description: str
    severity: str  # low, medium, critical

class ScamAnalyzeResponse(BaseModel):
    id: Optional[str] = None
    risk_level: str  # Low, Medium, High
    confidence_score: float  # calibrated 0.0 - 1.0
    detected_warning_signs: List[WarningSign]
    simple_explanation: str
    recommended_actions: List[str]
    official_reporting_links: List[str]
    language: str
    created_at: Optional[datetime] = None
