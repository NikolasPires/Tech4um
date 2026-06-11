from sqlalchemy import BigInteger, Column, ForeignKey, Integer, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        PrimaryKeyConstraint("user_id", "room_id", name="pk_participants"),
    )

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(BigInteger, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)

    room = relationship("Room", back_populates="participants")
    user = relationship("User")
