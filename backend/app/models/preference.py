import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    preferred_language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False)  # "hi" or "en"
    text_scale: Mapped[str] = mapped_column(String(20), default="normal", nullable=False)      # "normal", "large", "extra-large"
    high_contrast: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    theme: Mapped[str] = mapped_column(String(20), default="light", nullable=False)            # "light", "dark", "system"
    speech_output_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    speech_rate: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    reduced_motion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="preference")
