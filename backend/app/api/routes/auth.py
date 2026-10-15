from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.preference import UserPreference
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.core.exceptions import DigitalSaathiException, AuthenticationError
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if existing.scalar_one_or_none():
        raise DigitalSaathiException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
            error_code="EMAIL_EXISTS"
        )
    
    # Create new user
    new_user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(new_user)
    await db.flush()

    # Create default accessibility preferences
    default_pref = UserPreference(
        user_id=new_user.id,
        preferred_language="hi",
        text_scale="normal",
        high_contrast=False,
        theme="light",
        speech_output_enabled=True,
        speech_rate=1.0,
        reduced_motion=False
    )
    db.add(default_pref)
    await db.commit()

    # Generate token
    token = create_access_token(new_user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise AuthenticationError("Invalid email or password")
    
    if not user.is_active:
        raise AuthenticationError("Account is inactive")
        
    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out", "status": "success"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
