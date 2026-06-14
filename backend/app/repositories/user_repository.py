from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()

    async def list_users(self) -> list[User]:
        result = await self.db.execute(select(User).order_by(User.name))
        return list(result.scalars().all())

    async def create(self, user_create: UserCreate, password_hash: str) -> User:
        user = User(
            name=user_create.name,
            username=user_create.username,
            email=user_create.email,
            password_hash=password_hash,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
