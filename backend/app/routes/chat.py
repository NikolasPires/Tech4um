from collections import defaultdict
import asyncio
import json
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
from app.core.security import decode_access_token
from app.models.user import User
from sqlalchemy import select
from app.controllers.chat_controller import ChatController
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import (
    MessageCreate,
    MessageResponse,
    ParticipantCreate,
    ParticipantResponse,
    RoomCreate,
    RoomListResponse,
    RoomParticipantResponse,
    RoomResponse,
)
import redis.asyncio as aioredis
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/rooms/{room_id}/ticket")
async def get_websocket_ticket(
    room_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user),
):
    try:
        from app.controllers.websocket_controller import WebSocketController
        controller = WebSocketController(db)
        ticket = await controller.generate_ticket(
            user_id=current_user.id,
            room_id=room_id,
            username=current_user.username
        )
        return {"ticket": ticket}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.websocket("/ws/rooms/{room_id}/{ticket}")
async def websocket_room(
    websocket: WebSocket,
    room_id: int,
    ticket: str,
):
    db = AsyncSessionLocal()
    try:
        from app.controllers.websocket_controller import WebSocketController
        controller = WebSocketController(db)
        await controller.handle_connection(websocket, room_id, ticket)
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


@router.get("/rooms", response_model=list[RoomListResponse])
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
    messages = await ChatController(db).get_room_messages(
        room_id,
        current_user.id,
        limit=limit,
        offset=offset,
    )
    messages.reverse()
    return messages