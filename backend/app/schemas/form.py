from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class FormFieldInfo(BaseModel):
    field_id: str
    label: str
    field_type: str  # text, number, date, checkbox, select
    explanation_hi: str
    explanation_en: str
    example: str
    required: bool
    source_citation: Optional[str] = None

class FormExplainRequest(BaseModel):
    field_label: str
    form_context: Optional[str] = None
    language: Optional[str] = "hi"

class FormExplainResponse(BaseModel):
    field_label: str
    simple_explanation: str
    practical_example: str
    required_documents_hint: List[str] = []
    safety_note: str
    language: str

class FormParseResponse(BaseModel):
    document_id: str
    form_title: str
    fields: List[FormFieldInfo]
    total_fields: int
