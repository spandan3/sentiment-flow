from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class CallBase(BaseModel):
    s3_key: str
    original_filename: str

class CallCreate(CallBase):
    pass

class CallRead(CallBase):
    id: UUID
    created_at: datetime
    status: str
    duration_sec: Optional[int] = None

    class Config:
        from_attributes = True

class PresignRequest(BaseModel):
    filename: str
    content_type: str

class PresignResponse(BaseModel):
    upload_url: str
    s3_key: str

