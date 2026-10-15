from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.schemas.assistant import ChatRequest, AssistantResponse
from backend.app.services.assistant_service import assistant_service
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.task import TaskHistory
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/chat", response_model=AssistantResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Resolve or create conversation
    conversation_id = payload.conversation_id
    if conversation_id:
        conv_res = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id, Conversation.owner_id == current_user.id)
        )
        conversation = conv_res.scalar_one_or_none()
        if not conversation:
            conversation = Conversation(owner_id=current_user.id, title=payload.message[:40])
            db.add(conversation)
            await db.flush()
    else:
        conversation = Conversation(owner_id=current_user.id, title=payload.message[:40])
        db.add(conversation)
        await db.flush()

    # 2. Record User Message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
        language=payload.language or "hi"
    )
    db.add(user_msg)

    # 3. Call centralized Assistant Service
    response = await assistant_service.chat(
        message=payload.message,
        language=payload.language,
        user_id=current_user.id
    )
    response.conversation_id = conversation.id

    # 4. Record Assistant Message
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response.answer,
        language=response.language,
        intent=response.intent
    )
    db.add(assistant_msg)

    # 5. Log Task History
    task_entry = TaskHistory(
        owner_id=current_user.id,
        task_type="assistant_chat",
        title=f"बातचीत: {payload.message[:30]}...",
        status="completed"
    )
    db.add(task_entry)
    await db.commit()

    return response
