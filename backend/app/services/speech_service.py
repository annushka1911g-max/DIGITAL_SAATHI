from backend.app.providers.speech.base import BaseSpeechProvider
from backend.app.providers.speech.builtin_provider import BuiltinSpeechProvider

class SpeechService:
    def __init__(self, provider: BaseSpeechProvider = None):
        self.provider = provider or BuiltinSpeechProvider()

    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm", language: str = "hi") -> str:
        return await self.provider.transcribe(audio_bytes, mime_type, language)

    async def synthesize(self, text: str, language: str = "hi") -> bytes:
        return await self.provider.synthesize(text, language)

speech_service = SpeechService()
