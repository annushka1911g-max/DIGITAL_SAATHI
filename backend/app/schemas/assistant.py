from pydantic import BaseModel, Field
from typing import Optional, List, Any

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    language: Optional[str] = "hi"
    conversation_id: Optional[str] = None

class AssistantResponse(BaseModel):
    answer: str
    language: str = "hi"
    intent: str = "general_query"
    evidence: List[str] = []
    warnings: List[str] = []
    requires_confirmation: bool = False
    conversation_id: Optional[str] = None
    audio_base64: Optional[str] = None
    suggested_actions: List[str] = []
