from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.preference import UserPreference
from backend.app.schemas.preference import PreferenceResponse, PreferenceUpdate
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=PreferenceResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = result.scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref

@router.patch("", response_model=PreferenceResponse)
async def update_preferences(
    updates: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = result.scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        await db.flush()

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(pref, key, value)
            
    await db.commit()
    await db.refresh(pref)
    return pref
