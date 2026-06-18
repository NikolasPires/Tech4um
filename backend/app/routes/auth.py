from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.deps import get_async_db, get_current_user, oauth2_scheme
from app.repositories.user_repository import UserRepository
from app.schemas.user import Token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db),
):
    user = await UserRepository(db).get_by_username(form_data.username)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login_with_email(
    login_request: LoginRequest,
    db: AsyncSession = Depends(get_async_db),
):
    user = await UserRepository(db).get_by_email(login_request.email)
    if not user or not security.verify_password(login_request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user),
):
    try:
        from app.repositories.websocket_repository import ws_repository
        from app.repositories.chat_repository import ChatRepository
        from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

        # Salvar o token na blacklist
        await ws_repository.redis.setex(
            f"blacklisted_token:{token}",
            ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "1"
        )

        # Forçar a remoção do status online no Redis
        await ws_repository.redis.srem("online_users", str(current_user.id))
        await ws_repository.redis.delete(f"user_online_count:{current_user.id}")

        # Enviar evento user_offline para todas as salas
        chat_repo = ChatRepository(db)
        room_ids = await chat_repo.get_user_room_ids(current_user.id)
        for r_id in room_ids:
            await ws_repository.publish_to_room(
                r_id,
                {
                    "event": "user_offline",
                    "user_id": current_user.id,
                }
            )
    except Exception as e:
        print(f"Error executing logout in backend: {e}", flush=True)
    return {"status": "ok"}
