from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1024)


class RoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by: int
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ParticipantCreate(BaseModel):
    user_id: int


class ParticipantResponse(BaseModel):
    user_id: int
    room_id: int

    model_config = {
        "from_attributes": True,
    }


class MessageCreate(BaseModel):
    room_id: int
    message: str = Field(..., min_length=1)
    recipient_id: Optional[int] = None
    image_url: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    recipient_id: Optional[int] = None
    message: str
    image_url: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
