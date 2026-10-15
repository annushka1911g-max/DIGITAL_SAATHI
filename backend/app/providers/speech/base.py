from abc import ABC, abstractmethod
from typing import Optional

class BaseSpeechProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm", language: str = "hi") -> str:
        """Transcribe audio bytes to text"""
        pass

    @abstractmethod
    async def synthesize(self, text: str, language: str = "hi") -> bytes:
        """Convert text to spoken audio bytes (WAV/MP3)"""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        pass
