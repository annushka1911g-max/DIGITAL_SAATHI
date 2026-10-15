import uuid
from typing import Optional
from sqlalchemy import String, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin

class ScamAnalysis(Base, TimestampMixin):
    __tablename__ = "scam_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)  # "low", "medium", "high"
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    detected_signs_json: Mapped[str] = mapped_column(Text, nullable=False)  # list of signs
    explanations_json: Mapped[str] = mapped_column(Text, nullable=False)    # list of reasons
    recommended_actions_json: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False)
    analysis_version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)

    owner: Mapped["User"] = relationship("User", back_populates="scam_analyses")
