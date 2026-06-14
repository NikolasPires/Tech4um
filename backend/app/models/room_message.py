import sqlalchemy as sa
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class RoomMessage(Base):
    __tablename__ = "room_messages"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    room_id = Column(BigInteger, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    message = Column(Text, nullable=False)
    image_url = Column(String(length=1024), nullable=True)
    message_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    room = relationship("Room", back_populates="messages")
    user = relationship("User", foreign_keys=[user_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

    __table_args__ = (
        Index("ix_room_messages_room_recipient", "room_id", "recipient_id"),
        Index("ix_room_messages_room_created_desc", "room_id", sa.text("created_at DESC")),
    )
