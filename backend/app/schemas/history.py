from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class TaskHistoryResponse(BaseModel):
    id: str
    task_type: str
    title: str
    status: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
