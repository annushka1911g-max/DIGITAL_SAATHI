from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    page_count: int
    processing_status: str
    summary: Optional[str] = None
    summary_hi: Optional[str] = None
    key_entities: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentSummaryResponse(BaseModel):
    document_id: str
    summary: str
    summary_hi: str
    important_dates: List[str] = []
    amounts_mentioned: List[str] = []
    action_items: List[str] = []
    confidence: str = "high"

class DocumentAskRequest(BaseModel):
    question: str
    language: Optional[str] = "hi"

class DocumentAskResponse(BaseModel):
    question: str
    answer: str
    language: str
    page_references: List[int] = []
    evidence_snippets: List[str] = []
    confidence: str = "high"
