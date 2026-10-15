from backend.app.db.base import Base
from backend.app.models.user import User
from backend.app.models.preference import UserPreference
from backend.app.models.document import Document
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.task import TaskHistory
from backend.app.models.scam import ScamAnalysis

__all__ = [
    "Base",
    "User",
    "UserPreference",
    "Document",
    "Conversation",
    "Message",
    "TaskHistory",
    "ScamAnalysis",
]
