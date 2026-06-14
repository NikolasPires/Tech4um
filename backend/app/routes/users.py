from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers.user_controller import UserController
from app.core.deps import get_current_user, get_async_db
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_async_db),
):
    try:
        user = await UserController(db).register_user(user_create)
        return user
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user=Depends(get_current_user)):
    return current_user


@router.get("", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_async_db)):
    return await UserController(db).list_users()


@router.get("/{user_id}", response_model=UserRead)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    user = await UserController(db).get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
