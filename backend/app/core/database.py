from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL


def make_async_database_url(database_url: str) -> str:
    if database_url.startswith("sqlite+aiosqlite://"):
        return database_url
    if database_url.startswith("sqlite://"):
        return database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    if database_url.startswith("postgresql+psycopg2://"):
        return database_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    return database_url


Base = declarative_base()

async_database_url = make_async_database_url(DATABASE_URL)
async_connect_args = {}
if async_database_url.startswith("sqlite"):
    async_connect_args = {"check_same_thread": False}

async_engine = create_async_engine(async_database_url, connect_args=async_connect_args, future=True)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    future=True,
)
