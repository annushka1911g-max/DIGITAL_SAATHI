import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Digital Saathi API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database: Default SQLite for instant local dev & testing, auto-upgrades to PostgreSQL via env
    DATABASE_URL: str = "sqlite+aiosqlite:///./digital_saathi.db"
    SYNC_DATABASE_URL: str = "sqlite:///./digital_saathi.db"

    # Security & JWT
    JWT_SECRET_KEY: str = "digital-saathi-super-secure-production-secret-key-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI & Services
    LLM_PROVIDER: str = "demo"  # "demo", "gemini", "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"

    # Speech
    STT_PROVIDER: str = "builtin"  # "builtin", "bhashini", "openai"
    STT_API_KEY: str = ""
    TTS_PROVIDER: str = "builtin"  # "builtin", "bhashini", "openai"
    TTS_API_KEY: str = ""

    # Storage & Uploads
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 15

    # CORS
    FRONTEND_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
    ]

settings = Settings()
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
