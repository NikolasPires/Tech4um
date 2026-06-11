from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserController:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def register_user(self, user_create: UserCreate):
        if self.repository.get_by_username(user_create.username):
            raise ValueError("Username already exists")
        if self.repository.get_by_email(user_create.email):
            raise ValueError("Email already exists")

        password_hash = get_password_hash(user_create.password)
        return self.repository.create(user_create, password_hash)

    def get_user_by_id(self, user_id: int):
        return self.repository.get_by_id(user_id)

    def list_users(self):
        return self.repository.list_users()
