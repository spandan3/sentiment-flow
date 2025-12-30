import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..db.base import Base

class Call(Base):
    __tablename__ = "calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    s3_key = Column(Text, nullable=False)
    status = Column(String, nullable=False) # uploaded | processing | failed
    duration_sec = Column(Integer, nullable=True)
    original_filename = Column(Text)

