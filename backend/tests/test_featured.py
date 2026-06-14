import asyncio
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.deps import get_async_db
from app.core.database import Base
from app.models.room import Room
from app.models.room_message import RoomMessage
from app.models.user import User

# In-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def test_db(test_engine):
    connection = await test_engine.connect()
    transaction = await connection.begin()
    
    TestingSessionLocal = sessionmaker(
        bind=connection,
        class_=AsyncSession,
        expire_on_commit=False,
        future=True,
    )
    
    session = TestingSessionLocal()
    
    yield session
    
    await session.close()
    await transaction.rollback()
    await connection.close()

@pytest.mark.asyncio
async def test_featured_rooms(test_db):
    # Override get_async_db dependency
    async def override_get_async_db():
        yield test_db
    
    app.dependency_overrides[get_async_db] = override_get_async_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create a test user
        user = User(name="Test User", username="testuser", email="test@example.com", password_hash="hash")
        test_db.add(user)
        await test_db.commit()
        await test_db.refresh(user)
        
        # 2. Create 4 rooms
        rooms = []
        for i in range(4):
            room = Room(name=f"Room {i}", description=f"Desc {i}", created_by=user.id)
            test_db.add(room)
            rooms.append(room)
        await test_db.commit()
        for r in rooms:
            await test_db.refresh(r)
            
        # 3. Add messages to the rooms:
        # Room 0: 5 messages
        # Room 1: 3 messages
        # Room 2: 2 messages
        # Room 3: 0 messages
        message_counts = {0: 5, 1: 3, 2: 2, 3: 0}
        for idx, count in message_counts.items():
            for _ in range(count):
                msg = RoomMessage(room_id=rooms[idx].id, user_id=user.id, message="Hello")
                test_db.add(msg)
        await test_db.commit()
        
        # 4. Fetch the list of rooms
        response = await ac.get("/chat/rooms")
        assert response.status_code == 200
        data = response.json()
        
        # Assert that there are 4 rooms
        assert len(data) == 4
        
        # Check featured rooms (should be Room 0, Room 1, Room 2 because they have the most messages)
        # Room 3 should not be featured
        featured_rooms = [r for r in data if r["featured"] is True]
        not_featured_rooms = [r for r in data if r["featured"] is False]
        
        assert len(featured_rooms) == 3
        assert len(not_featured_rooms) == 1
        
        featured_names = {r["name"] for r in featured_rooms}
        assert "Room 0" in featured_names
        assert "Room 1" in featured_names
        assert "Room 2" in featured_names
        assert "Room 3" not in featured_names

    app.dependency_overrides.clear()
