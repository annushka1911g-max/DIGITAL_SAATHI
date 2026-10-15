from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PreferenceResponse(BaseModel):
    preferred_language: str
    text_scale: str
    high_contrast: bool
    theme: str
    speech_output_enabled: bool
    speech_rate: float
    reduced_motion: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class PreferenceUpdate(BaseModel):
    preferred_language: Optional[str] = None
    text_scale: Optional[str] = None
    high_contrast: Optional[bool] = None
    theme: Optional[str] = None
    speech_output_enabled: Optional[bool] = None
    speech_rate: Optional[float] = None
    reduced_motion: Optional[bool] = None
