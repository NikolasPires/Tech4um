from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import MessageCreate, RoomCreate


class ChatController:
    def __init__(self, db: AsyncSession):
        self.repository = ChatRepository(db)

    async def create_room(self, room_create: RoomCreate, created_by: int):
        return await self.repository.create_room(room_create, created_by)

    async def add_participant(self, room_id: int, user_id: int):
        return await self.repository.add_participant(room_id, user_id)

    async def create_message(self, message_create: MessageCreate, sender_id: int):
        return await self.repository.create_message(message_create, sender_id)

    async def get_room_messages(self, room_id: int, current_user_id: int, limit: int = 20, offset: int = 0):
        return await self.repository.get_room_messages(room_id, current_user_id, limit=limit, offset=offset)

    async def get_room(self, room_id: int):
        room = await self.repository.get_room_by_id(room_id)
        if room is None:
            return None

        featured_ids = await self.repository.get_featured_room_ids()
        return {
            "id": room.id,
            "name": room.name,
            "description": room.description,
            "created_by": room.created_by,
            "created_at": room.created_at,
            "featured": room.id in featured_ids,
        }

    async def list_room_participants(self, room_id: int):
        room = await self.repository.get_room_by_id(room_id)
        if room is None:
            raise ValueError('Room not found')

        participants = await self.repository.list_room_participants(room_id)
        
        from app.repositories.websocket_repository import ws_repository
        
        results = []
        for participant in participants:
            is_online = await ws_repository.is_user_online(participant.user_id)
            results.append({
                'user_id': participant.user_id,
                'room_id': participant.room_id,
                'name': participant.user.name,
                'username': participant.user.username,
                'email': participant.user.email,
                'is_creator': participant.user_id == room.created_by,
                'is_online': is_online,
            })
        return results

    async def list_rooms(self, limit: int = 20, offset: int = 0):
        rooms = await self.repository.list_rooms(limit=limit, offset=offset)
        featured_ids = await self.repository.get_featured_room_ids()

        return [
            {
                "id": room.id,
                "name": room.name,
                "description": room.description,
                "created_by": room.created_by,
                "created_at": room.created_at,
                "members": members,
                "featured": room.id in featured_ids,
            }
            for room, members in rooms
        ]
