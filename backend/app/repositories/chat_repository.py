from typing import List

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.participant import Participant
from app.models.room import Room
from app.models.room_message import RoomMessage
from app.models.user import User
from app.schemas.chat import MessageCreate, RoomCreate


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_room(self, room_create: RoomCreate, created_by: int) -> Room:
        room = Room(
            name=room_create.name,
            description=room_create.description,
            created_by=created_by,
        )
        self.db.add(room)
        await self.db.commit()
        await self.db.refresh(room)
        return room

    async def get_room_by_id(self, room_id: int) -> Room | None:
        return await self.db.get(Room, room_id)

    async def list_rooms(self, limit: int = 20, offset: int = 0):
        result = await self.db.execute(
            select(
                Room,
                func.count(Participant.user_id).label("members"),
            )
            .outerjoin(
                Participant,
                Participant.room_id == Room.id,
            )
            .group_by(Room.id)
            .order_by(Room.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        return result.all()

    async def list_room_participants(self, room_id: int) -> List[Participant]:
        result = await self.db.execute(
            select(Participant)
            .options(selectinload(Participant.user))
            .filter_by(room_id=room_id)
        )
        return result.scalars().all()

    async def get_participant(self, room_id: int, user_id: int) -> Participant | None:
        result = await self.db.execute(
            select(Participant).filter_by(room_id=room_id, user_id=user_id)
        )
        return result.scalar_one_or_none()

    async def add_participant(self, room_id: int, user_id: int) -> Participant:
        existing = await self.get_participant(room_id, user_id)
        if existing is not None:
            return existing

        participant = Participant(room_id=room_id, user_id=user_id)
        self.db.add(participant)
        await self.db.commit()
        await self.db.refresh(participant)
        return participant

    async def create_message(self, message_create: MessageCreate, sender_id: int) -> RoomMessage:
        message = RoomMessage(
            room_id=message_create.room_id,
            user_id=sender_id,
            recipient_id=message_create.recipient_id,
            message=message_create.message,
            image_url=message_create.image_url,
            message_metadata=message_create.message_metadata,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def get_room_messages(
        self,
        room_id: int,
        current_user_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> List[RoomMessage]:
        result = await self.db.execute(
            select(RoomMessage)
            .where(RoomMessage.room_id == room_id)
            .where(
                or_(
                    RoomMessage.recipient_id.is_(None),
                    RoomMessage.recipient_id == current_user_id,
                    RoomMessage.user_id == current_user_id,
                )
            )
            .order_by(RoomMessage.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def get_featured_room_ids(self) -> List[int]:
        from datetime import datetime, timezone, timedelta
        from app.models.room_message import RoomMessage

        last_24h = datetime.now(timezone.utc) - timedelta(hours=24)

        result = await self.db.execute(
            select(RoomMessage.room_id)
            .where(RoomMessage.created_at >= last_24h)
            .group_by(RoomMessage.room_id)
            .order_by(func.count(RoomMessage.id).desc())
            .limit(3)
        )
        return [row[0] for row in result.all()]
