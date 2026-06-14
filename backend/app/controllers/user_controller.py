from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserController:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    async def register_user(self, user_create: UserCreate):
        if await self.repository.get_by_username(user_create.username):
            raise ValueError("Username already exists")
        if await self.repository.get_by_email(user_create.email):
            raise ValueError("Email already exists")

        password_hash = get_password_hash(user_create.password)
        return await self.repository.create(user_create, password_hash)

    async def get_user_by_id(self, user_id: int):
        return await self.repository.get_by_id(user_id)

    async def list_users(self):
        return await self.repository.list_users()
