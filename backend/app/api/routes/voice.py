from fastapi import APIRouter, UploadFile, File, Form, Response, Depends
from typing import Optional
from pydantic import BaseModel
from backend.app.services.speech_service import speech_service
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter(tags=["Voice & Speech"])

class SynthesizeRequest(BaseModel):
    text: str
    language: Optional[str] = "hi"

@router.post("/voice/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("hi"),
    current_user: User = Depends(get_current_user)
):
    audio_content = await file.read()
    mime_type = file.content_type or "audio/webm"
    transcription = await speech_service.transcribe(audio_content, mime_type=mime_type, language=language)
    return {
        "text": transcription,
        "language": language,
        "status": "success"
    }

@router.post("/speech/synthesize")
async def synthesize_speech(
    payload: SynthesizeRequest,
    current_user: User = Depends(get_current_user)
):
    audio_bytes = await speech_service.synthesize(payload.text, language=payload.language or "hi")
    return Response(content=audio_bytes, media_type="audio/wav")

@router.post("/voice/synthesize")
async def voice_synthesize_alias(
    payload: SynthesizeRequest,
    current_user: User = Depends(get_current_user)
):
    return await synthesize_speech(payload, current_user)
