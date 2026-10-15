import json
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.task import TaskHistory
from backend.app.schemas.history import TaskHistoryResponse
from backend.app.core.exceptions import NotFoundError, PermissionDeniedError
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[TaskHistoryResponse])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TaskHistory)
        .where(TaskHistory.owner_id == current_user.id)
        .order_by(TaskHistory.created_at.desc())
        .limit(50)
    )
    items = result.scalars().all()
    out = []
    for item in items:
        details = json.loads(item.details_json) if item.details_json else {}
        out.append(TaskHistoryResponse(
            id=item.id,
            task_type=item.task_type,
            title=item.title,
            status=item.status,
            details=details,
            created_at=item.created_at
        ))
    return out

@router.delete("/{item_id}")
async def delete_history_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskHistory).where(TaskHistory.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise NotFoundError("History item not found")
    if item.owner_id != current_user.id:
        raise PermissionDeniedError("You do not have access to this history item")

    await db.delete(item)
    await db.commit()
    return {"message": "History item deleted", "status": "success"}
