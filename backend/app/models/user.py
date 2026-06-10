from sqlalchemy import Column, Integer, String

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=255), nullable=False)
    username = Column(String(length=150), unique=True, nullable=False, index=True)
    email = Column(String(length=255), unique=True, nullable=False, index=True)
    password_hash = Column(String(length=255), nullable=False)
