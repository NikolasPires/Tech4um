from collections import defaultdict

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.deps import get_async_db, get_current_user
from app.controllers.chat_controller import ChatController
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import (
    MessageCreate,
    MessageResponse,
    ParticipantCreate,
    ParticipantResponse,
    RoomCreate,
    RoomParticipantResponse,
    RoomResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ConnectionManager:
    def __init__(self):
        # room_id -> user_id -> websocket
        self.active_connections: dict[int, dict[int, WebSocket]] = defaultdict(dict)

    async def connect(
        self,
        websocket: WebSocket,
        room_id: int,
        user_id: int,
    ):
        await websocket.accept()
        print(4)
        self.active_connections[room_id][user_id] = websocket

    def disconnect(
        self,
        room_id: int,
        user_id: int,
    ):
        room_connections = self.active_connections.get(room_id)

        if room_connections:
            room_connections.pop(user_id, None)

            if not room_connections:
                self.active_connections.pop(room_id, None)

    async def send_to_user(
        self,
        room_id: int,
        user_id: int,
        message: dict,
    ):
        websocket = self.active_connections.get(room_id, {}).get(user_id)

        if websocket:
            await websocket.send_json(message)

    async def broadcast_room(
        self,
        room_id: int,
        message: dict,
    ):
        room_connections = self.active_connections.get(room_id, {})

        for websocket in room_connections.values():
            await websocket.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/rooms/{room_id}")
async def websocket_room(
    websocket: WebSocket,
    room_id: int,
    user_id: int,
):
    print("1")
    db = AsyncSessionLocal()

    try:
        print("2" + "Room " + str(room_id) + "User " + str(user_id))
        repository = ChatRepository(db)

        participant = await repository.get_participant(
            room_id,
            user_id,
        )
        print("3", participant)

        if not participant:
            await websocket.close(code=1008)
            return

        await manager.connect(
            websocket,
            room_id,
            user_id,
        )
        await manager.broadcast_room(
            room_id,
            {
                "event": "user_joined",
                "user_id": user_id,
            },
        )

        while True:
            payload = await websocket.receive_json()

            message_text = payload["message"]
            recipient_id = payload.get("recipient_id")

            message_create = MessageCreate(
                room_id=room_id,
                message=message_text,
                recipient_id=recipient_id,
            )

            saved_message = await ChatController(
                db
            ).create_message(
                message_create,
                user_id,
            )

            response = {
                "event": "new_message",
                "id": saved_message.id,
                "room_id": room_id,
                "user_id": user_id,
                "recipient_id": recipient_id,
                "message": saved_message.message,
                "created_at": saved_message.created_at.isoformat(),
            }

            # mensagem privada
            if recipient_id is not None:
                recipient_participant = await repository.get_participant(
                    room_id,
                    recipient_id,
                )

                if recipient_participant:
                    await manager.send_to_user(
                        room_id,
                        recipient_id,
                        response,
                    )

                # devolve para quem enviou
                await manager.send_to_user(
                    room_id,
                    user_id,
                    response,
                )

            # mensagem pública
            else:
                await manager.broadcast_room(
                    room_id,
                    response,
                )

    except WebSocketDisconnect:
        manager.disconnect(
            room_id,
            user_id,
        )

        await manager.broadcast_room(
            room_id,
            {
                "event": "user_left",
                "user_id": user_id,
            },
        )

    finally:
        await db.close()


@router.post(
    "/rooms",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_room(
    room_create: RoomCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user),
):
    room = await ChatController(db).create_room(
        room_create,
        current_user.id,
    )

    if room:
        await ChatController(db).add_participant(
            room.id,
            current_user.id,
        )

    return room


@router.get("/rooms", response_model=list[RoomResponse])
async def list_rooms(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_async_db),
):
    return await ChatController(db).list_rooms(
        limit=limit,
        offset=offset,
    )


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    room = await ChatController(db).get_room(room_id)

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    return room


@router.get(
    "/rooms/{room_id}/participants",
    response_model=list[RoomParticipantResponse],
)
async def list_room_participants(
    room_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user),
):
    return await ChatController(db).list_room_participants(room_id)


@router.post(
    "/rooms/{room_id}/participants",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_participant(
    room_id: int,
    participant_create: ParticipantCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user),
):
    if current_user.id != participant_create.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the authenticated user can add themselves as a participant.",
        )

    return await ChatController(db).add_participant(
        room_id,
        participant_create.user_id,
    )


@router.post(
    "/rooms/{room_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    room_id: int,
    message_create: MessageCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user),
):
    if message_create.room_id != room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room ID mismatch between path and payload.",
        )

    return await ChatController(db).create_message(
        message_create,
        current_user.id,
    )


@router.get(
    "/rooms/{room_id}/messages",
    response_model=list[MessageResponse],
)
async def get_room_messages(
    room_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_async_db),
    current_user=Depends(get_current_user),
):
    return await ChatController(db).get_room_messages(
        room_id,
        current_user.id,
        limit=limit,
        offset=offset,
    )